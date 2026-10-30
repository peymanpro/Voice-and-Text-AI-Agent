import "reflect-metadata";

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { DataSource } from "typeorm";

import {
  ConversationEntity,
  DemoSessionEntity,
  MessageEntity,
} from "../dist/database/entities/index.js";
import { CreateConversationPersistence1793360000000 } from "../dist/database/migrations/1793360000000-CreateConversationPersistence.js";
import { createTypeOrmOptions } from "../dist/database/typeorm-options.js";

function withLocalDatabaseEnvironment(callback) {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SQLITE_DATABASE: process.env.SQLITE_DATABASE,
    VERCEL: process.env.VERCEL,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
  };

  process.env.NODE_ENV = "test";
  delete process.env.DATABASE_URL;
  delete process.env.SQLITE_DATABASE;
  delete process.env.VERCEL;
  delete process.env.RAILWAY_ENVIRONMENT;

  try {
    return callback();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("creates the core schema, persists a conversation, and rolls back", async () => {
  await withLocalDatabaseEnvironment(async () => {
    const dataSource = new DataSource(createTypeOrmOptions());

    try {
      await dataSource.initialize();

      const pending = await dataSource.showMigrations();
      assert.equal(pending, true);

      const applied = await dataSource.runMigrations();
      assert.equal(applied.length, 1);
      assert.equal(await dataSource.showMigrations(), false);

      const tableRows = await dataSource.query(
        "SELECT name FROM sqlite_master WHERE type = 'table'",
      );
      const tableNames = tableRows.map((row) => row.name);

      assert.ok(tableNames.includes("demo_sessions"));
      assert.ok(tableNames.includes("conversations"));
      assert.ok(tableNames.includes("messages"));
      assert.ok(tableNames.includes("typeorm_migrations"));

      const tokenHash = createHash("sha256")
        .update("a-test-session-token")
        .digest("hex");
      const session = dataSource.getRepository(DemoSessionEntity).create({
        tokenHash,
      });
      await dataSource.getRepository(DemoSessionEntity).save(session);

      const conversationRepository = dataSource.getRepository(ConversationEntity);
      const conversation = conversationRepository.create({
        session,
        title: "First conversation",
        createdAt: "2026-10-30T00:00:00.000Z",
        updatedAt: "2026-10-30T00:00:00.000Z",
      });
      await conversationRepository.save(conversation);

      const messageRepository = dataSource.getRepository(MessageEntity);
      const message = messageRepository.create({
        conversation,
        role: "user",
        content: "Hello, agent.",
        sequence: 1,
        status: "complete",
        createdAt: "2026-10-30T00:00:01.000Z",
      });
      await messageRepository.save(message);

      const storedConversation = await conversationRepository.findOne({
        where: { id: conversation.id },
        relations: { session: true, messages: true },
      });

      assert.ok(storedConversation);
      assert.equal(storedConversation.session.id, session.id);
      assert.equal(storedConversation.messages.length, 1);
      assert.equal(storedConversation.messages[0].content, "Hello, agent.");
      assert.equal(
        storedConversation.messages[0].createdAt,
        "2026-10-30T00:00:01.000Z",
      );

      await assert.rejects(
        messageRepository.save(
          messageRepository.create({
            conversation,
            role: "assistant",
            content: "Duplicate sequence",
            sequence: 1,
            status: "complete",
            createdAt: "2026-10-30T00:00:02.000Z",
          }),
        ),
      );

      await assert.rejects(
        messageRepository.save(
          messageRepository.create({
            conversation,
            role: "administrator",
            content: "Invalid role",
            sequence: 2,
            status: "complete",
            createdAt: "2026-10-30T00:00:03.000Z",
          }),
        ),
      );

      await dataSource.undoLastMigration();
      assert.equal(await dataSource.showMigrations(), true);

      const remainingTables = await dataSource.query(
        "SELECT name FROM sqlite_master WHERE type = 'table'",
      );
      const remainingNames = remainingTables.map((row) => row.name);

      assert.equal(remainingNames.includes("demo_sessions"), false);
      assert.equal(remainingNames.includes("conversations"), false);
      assert.equal(remainingNames.includes("messages"), false);
    } finally {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  });
});

test("stores session token digests rather than raw session tokens", () => {
  const rawToken = "session-token-that-must-not-be-stored";
  const digest = createHash("sha256").update(rawToken).digest("hex");

  assert.equal(digest.length, 64);
  assert.notEqual(digest, rawToken);
});

const postgresTestUrl = process.env.TEST_DATABASE_URL;

test(
  "creates, queries, constrains, and rolls back the schema on PostgreSQL",
  { skip: !postgresTestUrl },
  async () => {
    const dataSource = new DataSource({
      type: "postgres",
      url: postgresTestUrl,
      entities: [DemoSessionEntity, ConversationEntity, MessageEntity],
      migrations: [CreateConversationPersistence1793360000000],
      migrationsRun: false,
      migrationsTableName: "typeorm_migrations",
      synchronize: false,
      logging: false,
    });

    try {
      await dataSource.initialize();

      assert.equal(await dataSource.showMigrations(), true);
      const applied = await dataSource.runMigrations();
      assert.equal(applied.length, 1);
      assert.equal(await dataSource.showMigrations(), false);

      const tokenHash = createHash("sha256")
        .update("postgres-test-session-token")
        .digest("hex");
      const session = dataSource.getRepository(DemoSessionEntity).create({
        tokenHash,
      });
      await dataSource.getRepository(DemoSessionEntity).save(session);

      const conversationRepository = dataSource.getRepository(ConversationEntity);
      const conversation = conversationRepository.create({
        session,
        title: "PostgreSQL integration",
        createdAt: "2026-10-30T00:00:00.000Z",
        updatedAt: "2026-10-30T00:00:00.000Z",
      });
      await conversationRepository.save(conversation);

      const messageRepository = dataSource.getRepository(MessageEntity);
      await messageRepository.save(
        messageRepository.create({
          conversation,
          role: "user",
          content: "Persisted on PostgreSQL.",
          sequence: 1,
          status: "complete",
          createdAt: "2026-10-30T00:00:01.000Z",
        }),
      );

      const stored = await conversationRepository.findOne({
        where: { id: conversation.id },
        relations: { session: true, messages: true },
      });

      assert.ok(stored);
      assert.equal(stored.session.id, session.id);
      assert.equal(stored.messages.length, 1);
      assert.equal(stored.messages[0].content, "Persisted on PostgreSQL.");

      await assert.rejects(
        messageRepository.save(
          messageRepository.create({
            conversation,
            role: "assistant",
            content: "Duplicate sequence",
            sequence: 1,
            status: "complete",
            createdAt: "2026-10-30T00:00:02.000Z",
          }),
        ),
      );

      await assert.rejects(
        messageRepository.save(
          messageRepository.create({
            conversation,
            role: "administrator",
            content: "Invalid role",
            sequence: 2,
            status: "complete",
            createdAt: "2026-10-30T00:00:03.000Z",
          }),
        ),
      );

      await dataSource.undoLastMigration();
      assert.equal(await dataSource.showMigrations(), true);

      const remainingTables = await dataSource.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema()",
      );
      const remainingNames = remainingTables.map((row) => row.table_name);

      assert.equal(remainingNames.includes("demo_sessions"), false);
      assert.equal(remainingNames.includes("conversations"), false);
      assert.equal(remainingNames.includes("messages"), false);
    } finally {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  },
);

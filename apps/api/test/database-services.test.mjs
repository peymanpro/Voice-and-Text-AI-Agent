import "reflect-metadata";

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { DataSource } from "typeorm";

import {
  ConversationEntity,
  DemoSessionEntity,
  MessageEntity,
} from "../dist/database/entities/index.js";
import { ConversationPersistenceService } from "../dist/database/persistence/conversation-persistence.service.js";
import { DemoSessionService } from "../dist/database/persistence/demo-session.service.js";
import { createTypeOrmOptions } from "../dist/database/typeorm-options.js";

async function withSQLiteDatabase(callback) {
  const keys = [
    "NODE_ENV",
    "DATABASE_URL",
    "SQLITE_DATABASE",
    "VERCEL",
    "RAILWAY_ENVIRONMENT",
  ];
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  process.env.NODE_ENV = "test";
  delete process.env.DATABASE_URL;
  delete process.env.VERCEL;
  delete process.env.RAILWAY_ENVIRONMENT;
  process.env.SQLITE_DATABASE = ":memory:";

  const dataSource = new DataSource(createTypeOrmOptions());

  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    return await callback(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    for (const key of keys) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

test("persists conversations and messages with enforced session ownership", async () => {
  await withSQLiteDatabase(async (dataSource) => {
    const sessionRepository = dataSource.getRepository(DemoSessionEntity);
    const sessions = new DemoSessionService(sessionRepository);
    const conversations = new ConversationPersistenceService(
      dataSource.getRepository(ConversationEntity),
      dataSource.getRepository(MessageEntity),
      sessions,
      dataSource,
    );

    const ownerSession = await sessions.issueSession();
    const otherSession = await sessions.issueSession();

    assert.equal(ownerSession.token.length, 43);
    assert.equal("tokenHash" in ownerSession, false);

    const storedSession = await sessionRepository.findOne({
      where: { id: ownerSession.sessionId },
    });
    assert.ok(storedSession);
    assert.equal(
      storedSession.tokenHash,
      createHash("sha256").update(ownerSession.token, "utf8").digest("hex"),
    );
    assert.notEqual(storedSession.tokenHash, ownerSession.token);

    const firstConversation = await conversations.createConversation(
      ownerSession.token,
      "Support investigation",
    );
    const secondConversation = await conversations.createConversation(
      ownerSession.token,
    );

    assert.equal(firstConversation.title, "Support investigation");
    assert.equal(secondConversation.title, "New conversation");

    const ownerConversations = await conversations.listConversations(
      ownerSession.token,
    );
    const otherConversations = await conversations.listConversations(
      otherSession.token,
    );

    assert.equal(ownerConversations.length, 2);
    assert.equal(otherConversations.length, 0);

    const firstMessage = await conversations.appendMessage(
      ownerSession.token,
      firstConversation.id,
      {
        role: "user",
        content: "Please inspect this issue.",
      },
    );
    const secondMessage = await conversations.appendMessage(
      ownerSession.token,
      firstConversation.id,
      {
        role: "assistant",
        content: "I will review the available evidence.",
      },
    );

    assert.equal(firstMessage.sequence, 1);
    assert.equal(secondMessage.sequence, 2);
    assert.equal(firstMessage.role, "user");
    assert.equal(secondMessage.role, "assistant");

    const loaded = await conversations.getConversation(
      ownerSession.token,
      firstConversation.id,
    );
    assert.equal(loaded.messages.length, 2);
    assert.equal(loaded.messages[0].sequence, 1);
    assert.equal(loaded.messages[1].sequence, 2);
    assert.equal(loaded.messages[0].content, "Please inspect this issue.");

    await assert.rejects(
      conversations.getConversation(otherSession.token, firstConversation.id),
      NotFoundException,
    );
    await assert.rejects(
      conversations.appendMessage(otherSession.token, firstConversation.id, {
        role: "user",
        content: "Attempt to cross session boundary.",
      }),
      NotFoundException,
    );
    await assert.rejects(
      conversations.getConversation("unknown-session-token", firstConversation.id),
      UnauthorizedException,
    );
    await assert.rejects(
      conversations.appendMessage(ownerSession.token, firstConversation.id, {
        role: "administrator",
        content: "Unsupported role",
      }),
      BadRequestException,
    );
    await assert.rejects(
      conversations.appendMessage(ownerSession.token, firstConversation.id, {
        role: "user",
        content: "   ",
      }),
      BadRequestException,
    );
    await assert.rejects(
      conversations.createConversation(ownerSession.token, "x".repeat(201)),
      BadRequestException,
    );
    await assert.rejects(
      sessions.issueSession(0),
      BadRequestException,
    );

    await sessionRepository.update(
      { id: otherSession.sessionId },
      { expiresAt: "2000-01-01T00:00:00.000Z" },
    );
    await assert.rejects(
      sessions.requireSession(otherSession.token),
      UnauthorizedException,
    );
  });
});

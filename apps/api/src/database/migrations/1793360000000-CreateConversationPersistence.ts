import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateConversationPersistence1793360000000
  implements MigrationInterface
{
  name = "CreateConversationPersistence1793360000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "demo_sessions",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "token_hash",
            type: "varchar",
            length: "64",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "varchar",
            length: "24",
            isNullable: false,
          },
          {
            name: "expires_at",
            type: "varchar",
            length: "24",
            isNullable: true,
          },
        ],
        indices: [
          new TableIndex({
            name: "UQ_demo_sessions_token_hash",
            columnNames: ["token_hash"],
            isUnique: true,
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "conversations",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "session_id",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            length: "200",
            default: "''",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "24",
            default: "'active'",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "varchar",
            length: "24",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "varchar",
            length: "24",
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_conversations_demo_session",
            columnNames: ["session_id"],
            referencedTableName: "demo_sessions",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
        indices: [
          new TableIndex({
            name: "IDX_conversations_session_updated",
            columnNames: ["session_id", "updated_at"],
          }),
        ],
        checks: [
          new TableCheck({
            name: "CHK_conversations_status",
            expression: '"status" IN ('active', 'archived')',
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "messages",
        columns: [
          {
            name: "id",
            type: "varchar",
            length: "36",
            isPrimary: true,
            isNullable: false,
          },
          {
            name: "conversation_id",
            type: "varchar",
            length: "36",
            isNullable: false,
          },
          {
            name: "role",
            type: "varchar",
            length: "16",
            isNullable: false,
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "status",
            type: "varchar",
            length: "16",
            default: "'complete'",
            isNullable: false,
          },
          {
            name: "sequence",
            type: "integer",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "varchar",
            length: "24",
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_messages_conversation",
            columnNames: ["conversation_id"],
            referencedTableName: "conversations",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
        indices: [
          new TableIndex({
            name: "UQ_messages_conversation_sequence",
            columnNames: ["conversation_id", "sequence"],
            isUnique: true,
          }),
        ],
        checks: [
          new TableCheck({
            name: "CHK_messages_role",
            expression: '"role" IN ('user', 'assistant', 'system', 'tool')',
          }),
          new TableCheck({
            name: "CHK_messages_status",
            expression: '"status" IN ('pending', 'complete', 'failed')',
          }),
          new TableCheck({
            name: "CHK_messages_sequence",
            expression: '"sequence" > 0',
          }),
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("messages", true);
    await queryRunner.dropTable("conversations", true);
    await queryRunner.dropTable("demo_sessions", true);
  }
}

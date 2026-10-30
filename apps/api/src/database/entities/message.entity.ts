import { randomUUID } from "node:crypto";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  RelationId,
} from "typeorm";

import type { ConversationEntity } from "./conversation.entity.js";

export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageStatus = "pending" | "complete" | "failed";

@Entity({ name: "messages" })
@Index("UQ_messages_conversation_sequence", ["conversation", "sequence"], {
  unique: true,
})
export class MessageEntity {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id = randomUUID();

  @ManyToOne(
    "ConversationEntity",
    "messages",
    { nullable: false, onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "conversation_id", referencedColumnName: "id" })
  conversation!: ConversationEntity;

  @RelationId((message: MessageEntity) => message.conversation)
  conversationId!: string;

  @Column({ type: "varchar", length: 16 })
  role!: MessageRole;

  @Column({ type: "text" })
  content!: string;

  @Column({
    type: "varchar",
    length: 16,
    default: "complete",
  })
  status: MessageStatus = "complete";

  @Column({ type: "integer" })
  sequence!: number;

  @Column({ name: "created_at", type: "varchar", length: 24 })
  createdAt = new Date().toISOString();
}

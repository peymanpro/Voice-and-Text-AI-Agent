import { randomUUID } from "node:crypto";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
} from "typeorm";

import type { DemoSessionEntity } from "./demo-session.entity.js";
import type { MessageEntity } from "./message.entity.js";

export type ConversationStatus = "active" | "archived";

@Entity({ name: "conversations" })
@Index("IDX_conversations_session_updated", ["session", "updatedAt"])
export class ConversationEntity {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string = randomUUID();

  @ManyToOne("DemoSessionEntity", "conversations", {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_id", referencedColumnName: "id" })
  session!: DemoSessionEntity;

  @RelationId((conversation: ConversationEntity) => conversation.session)
  sessionId!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  title = "";

  @Column({
    type: "varchar",
    length: 24,
    default: "active",
  })
  status: ConversationStatus = "active";

  @Column({ name: "created_at", type: "varchar", length: 24 })
  createdAt = new Date().toISOString();

  @Column({ name: "updated_at", type: "varchar", length: 24 })
  updatedAt = new Date().toISOString();

  @OneToMany("MessageEntity", "conversation")
  messages!: MessageEntity[];
}

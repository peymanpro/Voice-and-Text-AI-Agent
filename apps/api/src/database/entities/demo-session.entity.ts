import { randomUUID } from "node:crypto";
import { Column, Entity, OneToMany, PrimaryColumn, Index } from "typeorm";

import type { ConversationEntity } from "./conversation.entity.js";

@Entity({ name: "demo_sessions" })
@Index("UQ_demo_sessions_token_hash", ["tokenHash"], { unique: true })
export class DemoSessionEntity {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string = randomUUID();

  @Column({ name: "token_hash", type: "varchar", length: 64 })
  tokenHash!: string;

  @Column({
    name: "created_at",
    type: "varchar",
    length: 24,
  })
  createdAt = new Date().toISOString();

  @Column({
    name: "expires_at",
    type: "varchar",
    length: 24,
    nullable: true,
  })
  expiresAt: string | null = null;

  @OneToMany("ConversationEntity", "session")
  conversations!: ConversationEntity[];
}

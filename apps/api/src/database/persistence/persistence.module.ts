import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  ConversationEntity,
  DemoSessionEntity,
  MessageEntity,
} from "../entities/index.js";
import { ConversationPersistenceService } from "./conversation-persistence.service.js";
import { DemoSessionService } from "./demo-session.service.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([DemoSessionEntity, ConversationEntity, MessageEntity]),
  ],
  providers: [DemoSessionService, ConversationPersistenceService],
  exports: [DemoSessionService, ConversationPersistenceService],
})
export class PersistenceModule {}

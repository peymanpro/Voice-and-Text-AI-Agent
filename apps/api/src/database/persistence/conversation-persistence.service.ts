import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import type { MessageRole } from "../entities/message.entity.js";
import { ConversationEntity } from "../entities/conversation.entity.js";
import { MessageEntity } from "../entities/message.entity.js";
import { DemoSessionService } from "./demo-session.service.js";

const MAX_CONVERSATION_TITLE_LENGTH = 200;
const MAX_MESSAGE_CONTENT_LENGTH = 100_000;
const MESSAGE_ROLES = new Set<MessageRole>(["user", "assistant", "system", "tool"]);

export type AppendMessageInput = {
  role: MessageRole;
  content: string;
};

@Injectable()
export class ConversationPersistenceService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversations: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
    private readonly sessions: DemoSessionService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createConversation(
    sessionToken: string,
    title = "New conversation",
  ): Promise<ConversationEntity> {
    const session = await this.sessions.requireSession(sessionToken);
    const normalizedTitle = title.trim();

    if (normalizedTitle.length > MAX_CONVERSATION_TITLE_LENGTH) {
      throw new BadRequestException(
        `Conversation titles must not exceed ${MAX_CONVERSATION_TITLE_LENGTH} characters.`,
      );
    }

    const now = new Date().toISOString();
    const conversation = this.conversations.create({
      session,
      title: normalizedTitle || "New conversation",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return this.conversations.save(conversation);
  }

  async listConversations(sessionToken: string): Promise<ConversationEntity[]> {
    const session = await this.sessions.requireSession(sessionToken);

    return this.conversations.find({
      where: { session: { id: session.id } },
      order: { updatedAt: "DESC" },
    });
  }

  async getConversation(
    sessionToken: string,
    conversationId: string,
  ): Promise<ConversationEntity> {
    const session = await this.sessions.requireSession(sessionToken);
    const conversation = await this.conversations.findOne({
      where: {
        id: conversationId,
        session: { id: session.id },
      },
      relations: { messages: true },
      order: { messages: { sequence: "ASC" } },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation was not found.");
    }

    return conversation;
  }

  async appendMessage(
    sessionToken: string,
    conversationId: string,
    input: AppendMessageInput,
  ): Promise<MessageEntity> {
    const session = await this.sessions.requireSession(sessionToken);

    if (!MESSAGE_ROLES.has(input.role)) {
      throw new BadRequestException("Message role is not supported.");
    }

    if (typeof input.content !== "string" || input.content.trim().length === 0) {
      throw new BadRequestException("Message content must not be empty.");
    }

    if (input.content.length > MAX_MESSAGE_CONTENT_LENGTH) {
      throw new BadRequestException(
        `Message content must not exceed ${MAX_MESSAGE_CONTENT_LENGTH} characters.`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const conversationRepository = manager.getRepository(ConversationEntity);
      const messageRepository = manager.getRepository(MessageEntity);
      const query = conversationRepository
        .createQueryBuilder("conversation")
        .innerJoin("conversation.session", "session")
        .where("conversation.id = :conversationId", { conversationId })
        .andWhere("session.id = :sessionId", { sessionId: session.id });

      // Serialize message sequencing on PostgreSQL. SQLite relies on its
      // transaction and the unique (conversation_id, sequence) constraint.
      if (this.dataSource.options.type === "postgres") {
        query.setLock("pessimistic_write");
      }

      const conversation = await query.getOne();

      if (!conversation) {
        throw new NotFoundException("Conversation was not found.");
      }

      const previousMessage = await messageRepository.findOne({
        where: { conversation: { id: conversation.id } },
        order: { sequence: "DESC" },
      });
      const now = new Date().toISOString();
      const message = messageRepository.create({
        conversation,
        role: input.role,
        content: input.content,
        status: "complete",
        sequence: (previousMessage?.sequence ?? 0) + 1,
        createdAt: now,
      });
      const savedMessage = await messageRepository.save(message);

      conversation.updatedAt = now;
      await conversationRepository.save(conversation);

      return savedMessage;
    });
  }
}

export { ConversationEntity } from "./conversation.entity.js";
export { DemoSessionEntity } from "./demo-session.entity.js";
export { MessageEntity } from "./message.entity.js";

export type { ConversationStatus } from "./conversation.entity.js";
export type { MessageRole, MessageStatus } from "./message.entity.js";

import { ConversationEntity } from "./conversation.entity.js";
import { DemoSessionEntity } from "./demo-session.entity.js";
import { MessageEntity } from "./message.entity.js";

export const persistenceEntities = [
  DemoSessionEntity,
  ConversationEntity,
  MessageEntity,
] as const;

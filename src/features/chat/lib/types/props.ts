import { GeneratedFile } from "ai";

import { ChatAccess } from "./chat";
import type {
    DBChat,
    DBChatId,
    DBChatMessageId,
    DBChatVisibility,
    DBUpdateChat,
} from "./db";
import type { StoredUploadedFile } from "./file";
import type { ChatMessagePart, UIChatMessage } from "./message";
import type { StorageBucket } from "./storage";

export type WithChatMessageId = {
    messageId: DBChatMessageId;
};

export type WithChatId = {
    chatId: DBChatId;
};

export type WithChatIds = {
    chatIds: DBChatId[];
};

export type WithNewChatId = {
    newChatId: DBChatId;
};

export type WithMessage = {
    message: UIChatMessage;
};

export type WithMessages = {
    messages: UIChatMessage[];
};

export type WithMessagePart = {
    part: ChatMessagePart;
};

export type WithVisibility = {
    visibility: DBChatVisibility;
};

export type WithChat = {
    chat: DBChat;
};

export type WithIsOwner = {
    isOwner: boolean;
};

export type WithChatUpdate = {
    chat: DBUpdateChat;
};

export type WithChatAccess = {
    chatAccess: ChatAccess;
};

export type WithUpvote = {
    upvote: boolean;
};

export type WithDownvote = {
    downvote: boolean;
};

export type WithGeneratedImage = {
    generatedImage: GeneratedFile;
};

export type WithGeneratedFile = {
    generatedFile: Buffer<ArrayBufferLike>;
};

export type WithStoredUploadedFile = {
    storedFile: StoredUploadedFile;
};

export type WithStoredUploadedFiles = {
    storedFiles: StoredUploadedFile[];
};

export type WithFileId = {
    fileId: string;
};

export type WithContainerId = {
    containerId: string;
};

export type WithOptionalContainerId = {
    containerId?: string;
};

export type WithOptionalChatId = {
    chatId?: DBChatId;
};

export type WithOptionalVerifyChatAccess = {
    verifyChatAccess?: boolean;
};

export type WithStorageBucket = {
    bucket: StorageBucket;
};

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

let chatIdCounter = 0;
export function generateChatId(): DBChatId {
    chatIdCounter++;
    const timestamp = Date.now().toString().slice(-12);
    const random = Math.floor(Math.random() * 0x10000)
        .toString(16)
        .padStart(4, "0");
    const counter = (chatIdCounter % 0x100).toString(16).padStart(2, "0");
    return `30000000-0000-0000-${timestamp.slice(0, 4)}-${timestamp.slice(4, 10)}${random}${counter}` as DBChatId;
}

let messageIdCounter = 0;
export function generateMessageId(): DBChatMessageId {
    messageIdCounter++;
    const timestamp = Date.now().toString().slice(-12);
    const random = Math.floor(Math.random() * 0x10000)
        .toString(16)
        .padStart(4, "0");
    const counter = (messageIdCounter % 0x100).toString(16).padStart(2, "0");
    return `40000000-0000-0000-${timestamp.slice(0, 4)}-${timestamp.slice(4, 10)}${random}${counter}` as DBChatMessageId;
}

let userIdCounter = 0;
export function generateUserId(): DBUserId {
    userIdCounter++;
    const timestamp = Date.now().toString().slice(-12);
    const random = Math.floor(Math.random() * 0x10000)
        .toString(16)
        .padStart(4, "0");
    const counter = (userIdCounter % 0x100).toString(16).padStart(2, "0");
    return `00000000-0000-0000-${timestamp.slice(0, 4)}-${timestamp.slice(4, 10)}${random}${counter}` as DBUserId;
}

export function generateUserEmail(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;
}

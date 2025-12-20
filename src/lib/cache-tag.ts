import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { hashQuery } from "@/lib/utils";

export const tag = {
    userChats: (userId?: DBUserId) => `user-chats${userId ? `:${userId}` : ""}`,
    userChat: (chatId?: DBChatId) => `user-chat${chatId ? `:${chatId}` : ""}`,
    userChatsSearch: (userId?: DBUserId, query?: string) =>
        `user-chats-search${userId ? `:${userId}` : ""}${query ? `:${hashQuery(query)}` : ""}`,
    userInitialChatsSearch: (userId?: DBUserId) =>
        `user-initial-chats-search${userId ? `:${userId}` : ""}`,
    chatMessages: (chatId?: DBChatId) =>
        `chat-messages${chatId ? `:${chatId}` : ""}`,
    chatVisibility: (chatId?: DBChatId) =>
        `chat-visibility${chatId ? `:${chatId}` : ""}`,
    userProfile: (userId?: DBUserId) =>
        `user-profile${userId ? `:${userId}` : ""}`,
    userName: (userId?: DBUserId) => `user-name${userId ? `:${userId}` : ""}`,
    userSharedChats: (userId?: DBUserId) =>
        `user-shared-chats${userId ? `:${userId}` : ""}`,
    user: (userId?: DBUserId) => `user${userId ? `:${userId}` : ""}`,
    userChatPreferences: (userId?: DBUserId) =>
        `user-chat-preferences${userId ? `:${userId}` : ""}`,
    userMessagesRateLimit: (userId?: DBUserId) =>
        `user-messages-rate-limit${userId ? `:${userId}` : ""}`,
    userFilesRateLimit: (userId?: DBUserId) =>
        `user-files-rate-limit${userId ? `:${userId}` : ""}`,
} as const;

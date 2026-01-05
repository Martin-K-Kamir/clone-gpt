import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { hashQuery } from "@/lib/utils";

import { tag } from "./cache-tag";

describe("cache-tag", () => {
    describe("tag.userChats", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userChats();

            expect(result).toBe("user-chats");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userChats(userId);

            expect(result).toBe(`user-chats:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userChats(userId1)).toBe(`user-chats:${userId1}`);
            expect(tag.userChats(userId2)).toBe(`user-chats:${userId2}`);
        });
    });

    describe("tag.userChat", () => {
        it("should return base tag when chatId is undefined", () => {
            const result = tag.userChat();

            expect(result).toBe("user-chat");
        });

        it("should return tag with chatId when provided", () => {
            const chatId = generateChatId();
            const result = tag.userChat(chatId);

            expect(result).toBe(`user-chat:${chatId}`);
        });

        it("should handle different chatId values", () => {
            const chatId1 = generateChatId();
            const chatId2 = generateChatId();

            expect(tag.userChat(chatId1)).toBe(`user-chat:${chatId1}`);
            expect(tag.userChat(chatId2)).toBe(`user-chat:${chatId2}`);
        });
    });

    describe("tag.userChatsSearch", () => {
        it("should return base tag when both userId and query are undefined", () => {
            const result = tag.userChatsSearch();

            expect(result).toBe("user-chats-search");
        });

        it("should return tag with userId when only userId is provided", () => {
            const userId = generateUserId();
            const result = tag.userChatsSearch(userId);

            expect(result).toBe(`user-chats-search:${userId}`);
        });

        it("should return tag with query hash when only query is provided", () => {
            const query = "test query";
            const result = tag.userChatsSearch(undefined, query);

            const expectedHash = hashQuery(query);
            expect(result).toBe(`user-chats-search:${expectedHash}`);
        });

        it("should return tag with userId and query hash when both are provided", () => {
            const userId = generateUserId();
            const query = "search term";
            const result = tag.userChatsSearch(userId, query);

            const expectedHash = hashQuery(query);
            expect(result).toBe(`user-chats-search:${userId}:${expectedHash}`);
        });

        it("should use consistent hash for same query", () => {
            const query = "same query";
            const result1 = tag.userChatsSearch(undefined, query);
            const result2 = tag.userChatsSearch(undefined, query);

            expect(result1).toBe(result2);
        });

        it("should not append query hash for empty query string", () => {
            const userId = generateUserId();
            const result = tag.userChatsSearch(userId, "");

            expect(result).toBe(`user-chats-search:${userId}`);
        });
    });

    describe("tag.userInitialChatsSearch", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userInitialChatsSearch();

            expect(result).toBe("user-initial-chats-search");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userInitialChatsSearch(userId);

            expect(result).toBe(`user-initial-chats-search:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userInitialChatsSearch(userId1)).toBe(
                `user-initial-chats-search:${userId1}`,
            );
            expect(tag.userInitialChatsSearch(userId2)).toBe(
                `user-initial-chats-search:${userId2}`,
            );
        });
    });

    describe("tag.chatMessages", () => {
        it("should return base tag when chatId is undefined", () => {
            const result = tag.chatMessages();

            expect(result).toBe("chat-messages");
        });

        it("should return tag with chatId when provided", () => {
            const chatId = generateChatId();
            const result = tag.chatMessages(chatId);

            expect(result).toBe(`chat-messages:${chatId}`);
        });

        it("should handle different chatId values", () => {
            const chatId1 = generateChatId();
            const chatId2 = generateChatId();

            expect(tag.chatMessages(chatId1)).toBe(`chat-messages:${chatId1}`);
            expect(tag.chatMessages(chatId2)).toBe(`chat-messages:${chatId2}`);
        });
    });

    describe("tag.chatVisibility", () => {
        it("should return base tag when chatId is undefined", () => {
            const result = tag.chatVisibility();

            expect(result).toBe("chat-visibility");
        });

        it("should return tag with chatId when provided", () => {
            const chatId = generateChatId();
            const result = tag.chatVisibility(chatId);

            expect(result).toBe(`chat-visibility:${chatId}`);
        });

        it("should handle different chatId values", () => {
            const chatId1 = generateChatId();
            const chatId2 = generateChatId();

            expect(tag.chatVisibility(chatId1)).toBe(
                `chat-visibility:${chatId1}`,
            );
            expect(tag.chatVisibility(chatId2)).toBe(
                `chat-visibility:${chatId2}`,
            );
        });
    });

    describe("tag.userProfile", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userProfile();

            expect(result).toBe("user-profile");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userProfile(userId);

            expect(result).toBe(`user-profile:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userProfile(userId1)).toBe(`user-profile:${userId1}`);
            expect(tag.userProfile(userId2)).toBe(`user-profile:${userId2}`);
        });
    });

    describe("tag.userName", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userName();

            expect(result).toBe("user-name");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userName(userId);

            expect(result).toBe(`user-name:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userName(userId1)).toBe(`user-name:${userId1}`);
            expect(tag.userName(userId2)).toBe(`user-name:${userId2}`);
        });
    });

    describe("tag.userSharedChats", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userSharedChats();

            expect(result).toBe("user-shared-chats");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userSharedChats(userId);

            expect(result).toBe(`user-shared-chats:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userSharedChats(userId1)).toBe(
                `user-shared-chats:${userId1}`,
            );
            expect(tag.userSharedChats(userId2)).toBe(
                `user-shared-chats:${userId2}`,
            );
        });
    });

    describe("tag.user", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.user();

            expect(result).toBe("user");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.user(userId);

            expect(result).toBe(`user:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.user(userId1)).toBe(`user:${userId1}`);
            expect(tag.user(userId2)).toBe(`user:${userId2}`);
        });
    });

    describe("tag.userChatPreferences", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userChatPreferences();

            expect(result).toBe("user-chat-preferences");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userChatPreferences(userId);

            expect(result).toBe(`user-chat-preferences:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userChatPreferences(userId1)).toBe(
                `user-chat-preferences:${userId1}`,
            );
            expect(tag.userChatPreferences(userId2)).toBe(
                `user-chat-preferences:${userId2}`,
            );
        });
    });

    describe("tag.userMessagesRateLimit", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userMessagesRateLimit();

            expect(result).toBe("user-messages-rate-limit");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userMessagesRateLimit(userId);

            expect(result).toBe(`user-messages-rate-limit:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userMessagesRateLimit(userId1)).toBe(
                `user-messages-rate-limit:${userId1}`,
            );
            expect(tag.userMessagesRateLimit(userId2)).toBe(
                `user-messages-rate-limit:${userId2}`,
            );
        });
    });

    describe("tag.userFilesRateLimit", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userFilesRateLimit();

            expect(result).toBe("user-files-rate-limit");
        });

        it("should return tag with userId when provided", () => {
            const userId = generateUserId();
            const result = tag.userFilesRateLimit(userId);

            expect(result).toBe(`user-files-rate-limit:${userId}`);
        });

        it("should handle different userId values", () => {
            const userId1 = generateUserId();
            const userId2 = generateUserId();

            expect(tag.userFilesRateLimit(userId1)).toBe(
                `user-files-rate-limit:${userId1}`,
            );
            expect(tag.userFilesRateLimit(userId2)).toBe(
                `user-files-rate-limit:${userId2}`,
            );
        });
    });

    describe("tag object structure", () => {
        it("should have all expected tag functions", () => {
            expect(tag).toHaveProperty("userChats");
            expect(tag).toHaveProperty("userChat");
            expect(tag).toHaveProperty("userChatsSearch");
            expect(tag).toHaveProperty("userInitialChatsSearch");
            expect(tag).toHaveProperty("chatMessages");
            expect(tag).toHaveProperty("chatVisibility");
            expect(tag).toHaveProperty("userProfile");
            expect(tag).toHaveProperty("userName");
            expect(tag).toHaveProperty("userSharedChats");
            expect(tag).toHaveProperty("user");
            expect(tag).toHaveProperty("userChatPreferences");
            expect(tag).toHaveProperty("userMessagesRateLimit");
            expect(tag).toHaveProperty("userFilesRateLimit");
        });

        it("should have all tag functions as functions", () => {
            expect(typeof tag.userChats).toBe("function");
            expect(typeof tag.userChat).toBe("function");
            expect(typeof tag.userChatsSearch).toBe("function");
            expect(typeof tag.userInitialChatsSearch).toBe("function");
            expect(typeof tag.chatMessages).toBe("function");
            expect(typeof tag.chatVisibility).toBe("function");
            expect(typeof tag.userProfile).toBe("function");
            expect(typeof tag.userName).toBe("function");
            expect(typeof tag.userSharedChats).toBe("function");
            expect(typeof tag.user).toBe("function");
            expect(typeof tag.userChatPreferences).toBe("function");
            expect(typeof tag.userMessagesRateLimit).toBe("function");
            expect(typeof tag.userFilesRateLimit).toBe("function");
        });
    });
});

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
            const userId = "user-123" as any;
            const result = tag.userChats(userId);

            expect(result).toBe("user-chats:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userChats(userId1)).toBe("user-chats:user-abc");
            expect(tag.userChats(userId2)).toBe("user-chats:user-xyz");
        });
    });

    describe("tag.userChat", () => {
        it("should return base tag when chatId is undefined", () => {
            const result = tag.userChat();

            expect(result).toBe("user-chat");
        });

        it("should return tag with chatId when provided", () => {
            const chatId = "chat-123" as any;
            const result = tag.userChat(chatId);

            expect(result).toBe("user-chat:chat-123");
        });

        it("should handle different chatId values", () => {
            const chatId1 = "chat-abc" as any;
            const chatId2 = "chat-xyz" as any;

            expect(tag.userChat(chatId1)).toBe("user-chat:chat-abc");
            expect(tag.userChat(chatId2)).toBe("user-chat:chat-xyz");
        });
    });

    describe("tag.userChatsSearch", () => {
        it("should return base tag when both userId and query are undefined", () => {
            const result = tag.userChatsSearch();

            expect(result).toBe("user-chats-search");
        });

        it("should return tag with userId when only userId is provided", () => {
            const userId = "user-123" as any;
            const result = tag.userChatsSearch(userId);

            expect(result).toBe("user-chats-search:user-123");
        });

        it("should return tag with query hash when only query is provided", () => {
            const query = "test query";
            const result = tag.userChatsSearch(undefined, query);

            const expectedHash = hashQuery(query);
            expect(result).toBe(`user-chats-search:${expectedHash}`);
        });

        it("should return tag with userId and query hash when both are provided", () => {
            const userId = "user-123" as any;
            const query = "search term";
            const result = tag.userChatsSearch(userId, query);

            const expectedHash = hashQuery(query);
            expect(result).toBe(`user-chats-search:user-123:${expectedHash}`);
        });

        it("should use consistent hash for same query", () => {
            const query = "same query";
            const result1 = tag.userChatsSearch(undefined, query);
            const result2 = tag.userChatsSearch(undefined, query);

            expect(result1).toBe(result2);
        });

        it("should not append query hash for empty query string", () => {
            const userId = "user-123" as any;
            const result = tag.userChatsSearch(userId, "");

            expect(result).toBe("user-chats-search:user-123");
        });
    });

    describe("tag.userInitialChatsSearch", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userInitialChatsSearch();

            expect(result).toBe("user-initial-chats-search");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userInitialChatsSearch(userId);

            expect(result).toBe("user-initial-chats-search:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userInitialChatsSearch(userId1)).toBe(
                "user-initial-chats-search:user-abc",
            );
            expect(tag.userInitialChatsSearch(userId2)).toBe(
                "user-initial-chats-search:user-xyz",
            );
        });
    });

    describe("tag.chatMessages", () => {
        it("should return base tag when chatId is undefined", () => {
            const result = tag.chatMessages();

            expect(result).toBe("chat-messages");
        });

        it("should return tag with chatId when provided", () => {
            const chatId = "chat-123" as any;
            const result = tag.chatMessages(chatId);

            expect(result).toBe("chat-messages:chat-123");
        });

        it("should handle different chatId values", () => {
            const chatId1 = "chat-abc" as any;
            const chatId2 = "chat-xyz" as any;

            expect(tag.chatMessages(chatId1)).toBe("chat-messages:chat-abc");
            expect(tag.chatMessages(chatId2)).toBe("chat-messages:chat-xyz");
        });
    });

    describe("tag.chatVisibility", () => {
        it("should return base tag when chatId is undefined", () => {
            const result = tag.chatVisibility();

            expect(result).toBe("chat-visibility");
        });

        it("should return tag with chatId when provided", () => {
            const chatId = "chat-123" as any;
            const result = tag.chatVisibility(chatId);

            expect(result).toBe("chat-visibility:chat-123");
        });

        it("should handle different chatId values", () => {
            const chatId1 = "chat-abc" as any;
            const chatId2 = "chat-xyz" as any;

            expect(tag.chatVisibility(chatId1)).toBe(
                "chat-visibility:chat-abc",
            );
            expect(tag.chatVisibility(chatId2)).toBe(
                "chat-visibility:chat-xyz",
            );
        });
    });

    describe("tag.userProfile", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userProfile();

            expect(result).toBe("user-profile");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userProfile(userId);

            expect(result).toBe("user-profile:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userProfile(userId1)).toBe("user-profile:user-abc");
            expect(tag.userProfile(userId2)).toBe("user-profile:user-xyz");
        });
    });

    describe("tag.userName", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userName();

            expect(result).toBe("user-name");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userName(userId);

            expect(result).toBe("user-name:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userName(userId1)).toBe("user-name:user-abc");
            expect(tag.userName(userId2)).toBe("user-name:user-xyz");
        });
    });

    describe("tag.userSharedChats", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userSharedChats();

            expect(result).toBe("user-shared-chats");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userSharedChats(userId);

            expect(result).toBe("user-shared-chats:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userSharedChats(userId1)).toBe(
                "user-shared-chats:user-abc",
            );
            expect(tag.userSharedChats(userId2)).toBe(
                "user-shared-chats:user-xyz",
            );
        });
    });

    describe("tag.user", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.user();

            expect(result).toBe("user");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.user(userId);

            expect(result).toBe("user:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.user(userId1)).toBe("user:user-abc");
            expect(tag.user(userId2)).toBe("user:user-xyz");
        });
    });

    describe("tag.userChatPreferences", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userChatPreferences();

            expect(result).toBe("user-chat-preferences");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userChatPreferences(userId);

            expect(result).toBe("user-chat-preferences:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userChatPreferences(userId1)).toBe(
                "user-chat-preferences:user-abc",
            );
            expect(tag.userChatPreferences(userId2)).toBe(
                "user-chat-preferences:user-xyz",
            );
        });
    });

    describe("tag.userMessagesRateLimit", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userMessagesRateLimit();

            expect(result).toBe("user-messages-rate-limit");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userMessagesRateLimit(userId);

            expect(result).toBe("user-messages-rate-limit:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userMessagesRateLimit(userId1)).toBe(
                "user-messages-rate-limit:user-abc",
            );
            expect(tag.userMessagesRateLimit(userId2)).toBe(
                "user-messages-rate-limit:user-xyz",
            );
        });
    });

    describe("tag.userFilesRateLimit", () => {
        it("should return base tag when userId is undefined", () => {
            const result = tag.userFilesRateLimit();

            expect(result).toBe("user-files-rate-limit");
        });

        it("should return tag with userId when provided", () => {
            const userId = "user-123" as any;
            const result = tag.userFilesRateLimit(userId);

            expect(result).toBe("user-files-rate-limit:user-123");
        });

        it("should handle different userId values", () => {
            const userId1 = "user-abc" as any;
            const userId2 = "user-xyz" as any;

            expect(tag.userFilesRateLimit(userId1)).toBe(
                "user-files-rate-limit:user-abc",
            );
            expect(tag.userFilesRateLimit(userId2)).toBe(
                "user-files-rate-limit:user-xyz",
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

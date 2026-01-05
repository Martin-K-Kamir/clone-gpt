import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import {
    getUserChatById,
    uncachedGetUserChatById,
} from "./get-user-chat-by-id";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    getChatAccess: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

vi.mock("@/features/chat/services/db/get-chat-access", () => ({
    getChatAccess: mocks.getChatAccess,
}));

describe("getUserChatById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when chatId is invalid", async () => {
        await expect(
            getUserChatById({
                chatId: "not-a-uuid" as any,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            getUserChatById({
                chatId,
                userId: "not-a-uuid" as any,
            }),
        ).rejects.toThrow();
    });

    it("should throw when chat access is denied", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: false,
            chatFound: true,
            isOwner: false,
            isPrivate: true,
            isPublic: false,
        });

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        });

        await expect(
            uncachedGetUserChatById({ chatId, userId }),
        ).rejects.toThrow("The chat is not accessible");
    });

    it("should return chat when user is owner", async () => {
        const mockChat = {
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: CHAT_VISIBILITY.PRIVATE,
            chatFound: true,
            isOwner: true,
            isPrivate: true,
            isPublic: false,
        });

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: mockChat,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatById({ chatId, userId });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(chatId);
        if (result) {
            expect(result.isOwner).toBe(true);
        }
    });

    it("should return chat when user is not owner but has access", async () => {
        const mockChat = {
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000002" as DBUserId,
            title: "Public Chat",
            visibility: CHAT_VISIBILITY.PUBLIC,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: CHAT_VISIBILITY.PUBLIC,
            chatFound: true,
            isOwner: false,
            isPrivate: false,
            isPublic: true,
        });

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: mockChat,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatById({ chatId, userId });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(chatId);
        if (result) {
            expect(result.isOwner).toBe(false);
        }
    });

    it("should return chat when verifyChatAccess is false", async () => {
        const mockChat = {
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: mockChat,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatById({
            chatId,
            userId,
            verifyChatAccess: false,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(chatId);
        expect(mocks.getChatAccess).not.toHaveBeenCalled();
    });

    it("should throw when chat not found and throwOnNotFound is true", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: CHAT_VISIBILITY.PRIVATE,
            chatFound: true,
            isOwner: true,
            isPrivate: true,
            isPublic: false,
        });

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        });

        await expect(
            uncachedGetUserChatById({ chatId, userId, throwOnNotFound: true }),
        ).rejects.toThrow("Chat not found");
    });

    it("should return null when chat not found and throwOnNotFound is false", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: CHAT_VISIBILITY.PRIVATE,
            chatFound: true,
            isOwner: true,
            isPrivate: true,
            isPublic: false,
        });

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatById({
            chatId,
            userId,
            throwOnNotFound: false,
        });

        expect(result).toBeNull();
    });

    it("should throw when fetch fails", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: CHAT_VISIBILITY.PRIVATE,
            chatFound: true,
            isOwner: true,
            isPrivate: true,
            isPublic: false,
        });

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        });

        await expect(
            uncachedGetUserChatById({ chatId, userId }),
        ).rejects.toThrow("Failed to fetch user chat");
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

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

    it("throws when chatId is invalid", async () => {
        await expect(
            getUserChatById({
                chatId: "not-a-uuid" as any,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            getUserChatById({
                chatId,
                userId: "not-a-uuid" as any,
            }),
        ).rejects.toThrow();
    });

    it("throws when chat access is denied", async () => {
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

    it("returns chat when user is owner", async () => {
        const mockChat = {
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: "private",
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
        expect((result as any).isOwner).toBe(true);
    });

    it("returns chat when user is not owner but has access", async () => {
        const mockChat = {
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000def" as DBUserId,
            title: "Public Chat",
            visibility: "public",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: "public",
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
        expect((result as any).isOwner).toBe(false);
    });

    it("returns chat when verifyChatAccess is false", async () => {
        const mockChat = {
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
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

    it("throws when chat not found and throwOnNotFound is true", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: "private",
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

    it("returns null when chat not found and throwOnNotFound is false", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: "private",
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

    it("throws on supabase error", async () => {
        mocks.getChatAccess.mockResolvedValue({
            allowed: true,
            visibility: "private",
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

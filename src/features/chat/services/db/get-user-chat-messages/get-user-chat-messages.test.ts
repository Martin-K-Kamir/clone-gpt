import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import {
    getUserChatMessages,
    uncachedGetUserChatMessages,
} from "./get-user-chat-messages";

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

describe("getUserChatMessages", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when chatId is invalid", async () => {
        await expect(
            getUserChatMessages({
                chatId: "not-a-uuid" as any,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            getUserChatMessages({
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
                    order: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            }),
        });

        await expect(
            uncachedGetUserChatMessages({ chatId, userId }),
        ).rejects.toThrow("The chat is not accessible");
    });

    it("returns messages when user is owner", async () => {
        const mockMessages = [
            {
                id: "msg-1",
                chatId,
                userId,
                role: "user",
                content: "Hello",
                metadata: { isUpvoted: true },
                parts: [],
                createdAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "msg-2",
                chatId,
                userId,
                role: "assistant",
                content: "Hi there",
                metadata: { isDownvoted: false },
                parts: [],
                createdAt: "2024-01-01T00:01:00Z",
            },
        ];

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
                    order: vi.fn().mockResolvedValue({
                        data: mockMessages,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatMessages({ chatId, userId });

        expect(result.data).toHaveLength(2);
        expect(result.visibility).toBe("private");
        expect(result.isOwner).toBe(true);
    });

    it("returns messages with metadata reset when user is not owner", async () => {
        const mockMessages = [
            {
                id: "msg-1",
                chatId,
                userId,
                role: "user",
                content: "Hello",
                metadata: { isUpvoted: true, isDownvoted: false },
                parts: [],
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

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
                    order: vi.fn().mockResolvedValue({
                        data: mockMessages,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatMessages({ chatId, userId });

        expect(result.data).toHaveLength(1);
        expect((result.data[0] as any).metadata.isUpvoted).toBe(false);
        expect((result.data[0] as any).metadata.isDownvoted).toBe(false);
        expect(result.visibility).toBe("public");
        expect(result.isOwner).toBe(false);
    });

    it("returns messages when verifyChatAccess is false", async () => {
        const mockMessages = [
            {
                id: "msg-1",
                chatId,
                userId,
                role: "user",
                content: "Hello",
                metadata: {},
                parts: [],
                createdAt: "2024-01-01T00:00:00Z",
            },
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                        data: mockMessages,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatMessages({
            chatId,
            userId,
            verifyChatAccess: false,
        });

        expect(result.data).toHaveLength(1);
        expect(mocks.getChatAccess).not.toHaveBeenCalled();
        expect(result.visibility).toBeUndefined();
        expect(result.isOwner).toBeUndefined();
    });

    it("handles empty messages", async () => {
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
                    order: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            }),
        });

        const result = await uncachedGetUserChatMessages({ chatId, userId });

        expect(result.data).toHaveLength(0);
        expect(result.visibility).toBe("private");
        expect(result.isOwner).toBe(true);
    });

    it("throws when fetch fails", async () => {
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
                    order: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        });

        await expect(
            uncachedGetUserChatMessages({ chatId, userId }),
        ).rejects.toThrow("Failed to fetch chat messages");
    });
});

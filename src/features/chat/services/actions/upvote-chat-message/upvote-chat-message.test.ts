import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { upvoteChatMessage } from "./upvote-chat-message";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
    chatId: "30000000-0000-0000-0000-000000000001" as DBChatId,
    messageId: "40000000-0000-0000-0000-000000000001" as DBChatMessageId,
}));

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: constants.userId, name: "Test User" },
    }),
}));

const apiSuccess = { ok: true };
const apiError = { ok: false };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                upvote: vi.fn(() => apiSuccess),
            },
        },
        error: {
            chat: {
                upvote: vi.fn(() => apiError),
            },
        },
    },
}));

describe("upvoteChatMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        } as any);
    });

    it("should upvote message successfully", async () => {
        const mockMessage = {
            id: constants.messageId,
            chatId: constants.chatId,
            userId: constants.userId,
            content: "Test message",
            metadata: {},
        };

        const selectChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: mockMessage,
                error: null,
            }),
        };

        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { ...mockMessage, metadata: { isUpvoted: true } },
                error: null,
            }),
        };

        let callCount = 0;
        mocks.from.mockImplementation(() => {
            callCount++;
            return callCount === 1 ? selectChain : updateChain;
        });

        const result = await upvoteChatMessage({
            messageId: constants.messageId,
            chatId: constants.chatId,
            upvote: true,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should remove upvote successfully", async () => {
        const mockMessage = {
            id: constants.messageId,
            chatId: constants.chatId,
            userId: constants.userId,
            content: "Test message",
            metadata: { isUpvoted: true },
        };

        const selectChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: mockMessage,
                error: null,
            }),
        };

        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { ...mockMessage, metadata: { isUpvoted: false } },
                error: null,
            }),
        };

        let callCount = 0;
        mocks.from.mockImplementation(() => {
            callCount++;
            return callCount === 1 ? selectChain : updateChain;
        });

        const result = await upvoteChatMessage({
            messageId: constants.messageId,
            chatId: constants.chatId,
            upvote: false,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should return error when session is missing", async () => {
        vi.mocked(auth).mockResolvedValueOnce(null as any);

        const result = await upvoteChatMessage({
            messageId: constants.messageId,
            chatId: constants.chatId,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when message update fails", async () => {
        const mockMessage = {
            id: constants.messageId,
            chatId: constants.chatId,
            userId: constants.userId,
            content: "Test message",
            metadata: {},
        };

        const selectChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: mockMessage,
                error: null,
            }),
        };

        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "update failed" },
            }),
        };

        let callCount = 0;
        mocks.from.mockImplementation(() => {
            callCount++;
            return callCount === 1 ? selectChain : updateChain;
        });

        const result = await upvoteChatMessage({
            messageId: constants.messageId,
            chatId: constants.chatId,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when messageId is invalid", async () => {
        const result = await upvoteChatMessage({
            messageId: "not-a-uuid" as any,
            chatId: constants.chatId as any,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chatId is invalid", async () => {
        const result = await upvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: "not-a-uuid" as any,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when upvote is invalid", async () => {
        const result = await upvoteChatMessage({
            messageId: constants.messageId,
            chatId: constants.chatId,
            upvote: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

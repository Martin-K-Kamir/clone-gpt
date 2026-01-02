import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { downvoteChatMessage } from "./downvote-chat-message";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
    chatId: "30000000-0000-0000-0000-000000000abc",
    messageId: "40000000-0000-0000-0000-000000000abc",
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
                downvote: vi.fn(() => apiSuccess),
            },
        },
        error: {
            chat: {
                downvote: vi.fn(() => apiError),
            },
        },
    },
}));

describe("downvoteChatMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
    });

    it("returns success when downvoting a message", async () => {
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
                data: { ...mockMessage, metadata: { isDownvoted: true } },
                error: null,
            }),
        };

        let callCount = 0;
        mocks.from.mockImplementation(() => {
            callCount++;
            return callCount === 1 ? selectChain : updateChain;
        });

        const result = await downvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            downvote: true,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns success when removing downvote from a message", async () => {
        const mockMessage = {
            id: constants.messageId,
            chatId: constants.chatId,
            userId: constants.userId,
            content: "Test message",
            metadata: { isDownvoted: true },
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
                data: { ...mockMessage, metadata: { isDownvoted: false } },
                error: null,
            }),
        };

        let callCount = 0;
        mocks.from.mockImplementation(() => {
            callCount++;
            return callCount === 1 ? selectChain : updateChain;
        });

        const result = await downvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            downvote: false,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns error when session is missing", async () => {
        (auth as any).mockResolvedValueOnce(null);

        const result = await downvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            downvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when message update fails", async () => {
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

        const result = await downvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            downvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when messageId is invalid", async () => {
        const result = await downvoteChatMessage({
            messageId: "not-a-uuid" as any,
            chatId: constants.chatId as any,
            downvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatId is invalid", async () => {
        const result = await downvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: "not-a-uuid" as any,
            downvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when downvote is invalid", async () => {
        const result = await downvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            downvote: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

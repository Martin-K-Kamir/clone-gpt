import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { upvoteChatMessage } from "./upvote-chat-message";

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
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
    });

    it("returns success when upvoting a message", async () => {
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
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            upvote: true,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns success when removing upvote from a message", async () => {
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
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            upvote: false,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns error when session is missing", async () => {
        (auth as any).mockResolvedValueOnce(null);

        const result = await upvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            upvote: true,
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

        const result = await upvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when messageId is invalid", async () => {
        const result = await upvoteChatMessage({
            messageId: "not-a-uuid" as any,
            chatId: constants.chatId as any,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatId is invalid", async () => {
        const result = await upvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: "not-a-uuid" as any,
            upvote: true,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when upvote is invalid", async () => {
        const result = await upvoteChatMessage({
            messageId: constants.messageId as any,
            chatId: constants.chatId as any,
            upvote: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

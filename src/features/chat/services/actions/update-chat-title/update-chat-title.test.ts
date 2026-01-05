import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { updateChatTitle } from "./update-chat-title";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
    chatId: "30000000-0000-0000-0000-000000000001" as DBChatId,
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: mocks.userId, name: "Test User" },
    }),
}));

const apiSuccess = { ok: true };
const apiError = { ok: false };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                rename: vi.fn(() => apiSuccess),
            },
        },
        error: {
            chat: {
                rename: vi.fn(() => apiError),
            },
        },
    },
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("updateChatTitle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth).mockResolvedValue({
            user: { id: mocks.userId, name: "Test User" },
        } as any);
    });

    it("should update chat title successfully", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
        };

        updateChain.eq.mockReturnValueOnce(updateChain);
        updateChain.eq.mockResolvedValueOnce({
            data: null,
            error: null,
        });

        mocks.from.mockReturnValue(updateChain);

        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: "New Title",
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should truncate title longer than 25 characters", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
        };

        updateChain.eq.mockReturnValueOnce(updateChain);
        updateChain.eq.mockResolvedValueOnce({
            data: null,
            error: null,
        });

        mocks.from.mockReturnValue(updateChain);

        const longTitle =
            "This is a very long title that exceeds 25 characters";
        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: longTitle,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should not truncate title exactly 25 characters", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
        };

        updateChain.eq.mockReturnValueOnce(updateChain);
        updateChain.eq.mockResolvedValueOnce({
            data: null,
            error: null,
        });

        mocks.from.mockReturnValue(updateChain);

        const exactTitle = "1234567890123456789012345";
        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: exactTitle,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should return error when session is missing", async () => {
        vi.mocked(auth).mockResolvedValueOnce(null as any);

        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: "New Title",
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when update fails", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi
                .fn()
                .mockReturnThis()
                .mockResolvedValue({
                    data: null,
                    error: { message: "update failed" },
                }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: "New Title",
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chatId is invalid", async () => {
        const result = await updateChatTitle({
            chatId: "not-a-uuid" as any,
            newTitle: "New Title",
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when title is invalid", async () => {
        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: "",
        });

        expect(result).toEqual(apiError);
    });

    it("should handle very long title with truncation", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
        };

        updateChain.eq.mockReturnValueOnce(updateChain);
        updateChain.eq.mockResolvedValueOnce({
            data: null,
            error: null,
        });

        mocks.from.mockReturnValue(updateChain);

        const veryLongTitle = "a".repeat(100);
        const result = await updateChatTitle({
            chatId: mocks.chatId,
            newTitle: veryLongTitle,
        });

        expect(result).toEqual(apiSuccess);
    });
});

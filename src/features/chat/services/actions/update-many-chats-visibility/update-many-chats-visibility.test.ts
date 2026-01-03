import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { updateManyChatsVisibility } from "./update-many-chats-visibility";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
    chatId1: "30000000-0000-0000-0000-000000000abc",
    chatId2: "30000000-0000-0000-0000-000000000def",
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
                visibility: vi.fn(() => apiSuccess),
            },
        },
        error: {
            chat: {
                visibility: vi.fn(() => apiError),
            },
        },
    },
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("updateManyChatsVisibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
    });

    it("updates visibility to public successfully", async () => {
        const mockChats = [
            {
                id: constants.chatId1,
                userId: constants.userId,
                visibility: "public",
            },
            {
                id: constants.chatId2,
                userId: constants.userId,
                visibility: "public",
            },
        ];

        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({
                data: mockChats,
                error: null,
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1, constants.chatId2] as any,
            visibility: "public",
        });

        expect(result).toEqual(apiSuccess);
    });

    it("updates visibility to private successfully", async () => {
        const mockChats = [
            {
                id: constants.chatId1,
                userId: constants.userId,
                visibility: "private",
            },
        ];

        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({
                data: mockChats,
                error: null,
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1] as any,
            visibility: "private",
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns error when session is missing", async () => {
        (auth as any).mockResolvedValueOnce(null);

        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1] as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when update fails", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "update failed" },
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1] as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatIds is invalid", async () => {
        const result = await updateManyChatsVisibility({
            chatIds: ["not-a-uuid"] as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when visibility is invalid", async () => {
        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1] as any,
            visibility: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatIds is empty array", async () => {
        const result = await updateManyChatsVisibility({
            chatIds: [] as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("handles single chatId", async () => {
        const mockChats = [
            {
                id: constants.chatId1,
                userId: constants.userId,
                visibility: "public",
            },
        ];

        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({
                data: mockChats,
                error: null,
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1] as any,
            visibility: "public",
        });

        expect(result).toEqual(apiSuccess);
    });
});

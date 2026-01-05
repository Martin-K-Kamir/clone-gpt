import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { updateManyChatsVisibility } from "./update-many-chats-visibility";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
    chatId1: "30000000-0000-0000-0000-000000000001" as DBChatId,
    chatId2: "30000000-0000-0000-0000-000000000002" as DBChatId,
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
        vi.mocked(auth).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        } as any);
    });

    it("should update visibility to public successfully", async () => {
        const mockChats = [
            {
                id: constants.chatId1,
                userId: constants.userId,
                visibility: CHAT_VISIBILITY.PUBLIC,
            },
            {
                id: constants.chatId2,
                userId: constants.userId,
                visibility: CHAT_VISIBILITY.PUBLIC,
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
            chatIds: [constants.chatId1, constants.chatId2],
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should update visibility to private successfully", async () => {
        const mockChats = [
            {
                id: constants.chatId1,
                userId: constants.userId,
                visibility: CHAT_VISIBILITY.PRIVATE,
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
            chatIds: [constants.chatId1],
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should return error when session is missing", async () => {
        vi.mocked(auth).mockResolvedValueOnce(null as any);

        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1],
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when update fails", async () => {
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
            chatIds: [constants.chatId1],
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chatIds is invalid", async () => {
        const result = await updateManyChatsVisibility({
            chatIds: ["not-a-uuid"] as any,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when visibility is invalid", async () => {
        const result = await updateManyChatsVisibility({
            chatIds: [constants.chatId1],
            visibility: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chatIds is empty array", async () => {
        const result = await updateManyChatsVisibility({
            chatIds: [] as any,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should handle single chatId", async () => {
        const mockChats = [
            {
                id: constants.chatId1,
                userId: constants.userId,
                visibility: CHAT_VISIBILITY.PUBLIC,
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
            chatIds: [constants.chatId1],
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiSuccess);
    });
});

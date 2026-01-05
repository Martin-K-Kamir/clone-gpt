import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import type { DBUserId } from "@/features/user/lib/types";

import { setAllUserChatsVisibility } from "./set-all-user-chats-visibility";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
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

describe("setAllUserChatsVisibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        } as any);
    });

    it("should set all chats visibility to public successfully", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await setAllUserChatsVisibility({
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should set all chats visibility to private successfully", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await setAllUserChatsVisibility({
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should return error when session is missing", async () => {
        vi.mocked(auth).mockResolvedValueOnce(null as any);

        const result = await setAllUserChatsVisibility({
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when update fails", async () => {
        const updateChain = {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: "update failed" },
            }),
        };

        mocks.from.mockReturnValue(updateChain);

        const result = await setAllUserChatsVisibility({
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when visibility is invalid", async () => {
        const result = await setAllUserChatsVisibility({
            visibility: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

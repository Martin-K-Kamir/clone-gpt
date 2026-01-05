import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { updateChatVisibility } from "./update-chat-visibility";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
    chatId: "30000000-0000-0000-0000-000000000001" as DBChatId,
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

describe("updateChatVisibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        } as any);
    });

    it("should update visibility to public successfully", async () => {
        const updatedChat = {
            visibility: CHAT_VISIBILITY.PUBLIC,
        };

        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: updatedChat,
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await updateChatVisibility({
            chatId: constants.chatId,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should update visibility to private successfully", async () => {
        const updatedChat = {
            visibility: CHAT_VISIBILITY.PRIVATE,
        };

        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: updatedChat,
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await updateChatVisibility({
            chatId: constants.chatId,
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should return error when session is missing", async () => {
        vi.mocked(auth).mockResolvedValueOnce(null as any);

        const result = await updateChatVisibility({
            chatId: constants.chatId,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chat update fails", async () => {
        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: "update failed" },
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await updateChatVisibility({
            chatId: constants.chatId,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chatId is invalid", async () => {
        const result = await updateChatVisibility({
            chatId: "not-a-uuid" as any,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when visibility is invalid", async () => {
        const result = await updateChatVisibility({
            chatId: constants.chatId,
            visibility: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

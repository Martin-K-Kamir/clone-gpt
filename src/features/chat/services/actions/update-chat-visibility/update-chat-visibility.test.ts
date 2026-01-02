import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { updateChatVisibility } from "./update-chat-visibility";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
    chatId: "30000000-0000-0000-0000-000000000abc",
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
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
    });

    it("returns success when updating visibility to public", async () => {
        const updatedChat = {
            visibility: "public" as const,
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
            chatId: constants.chatId as any,
            visibility: "public",
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns success when updating visibility to private", async () => {
        const updatedChat = {
            visibility: "private" as const,
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
            chatId: constants.chatId as any,
            visibility: "private",
        });

        expect(result).toEqual(apiSuccess);
    });

    it("returns error when session is missing", async () => {
        (auth as any).mockResolvedValueOnce(null);

        const result = await updateChatVisibility({
            chatId: constants.chatId as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chat update fails", async () => {
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
            chatId: constants.chatId as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatId is invalid", async () => {
        const result = await updateChatVisibility({
            chatId: "not-a-uuid" as any,
            visibility: "public",
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when visibility is invalid", async () => {
        const result = await updateChatVisibility({
            chatId: constants.chatId as any,
            visibility: "invalid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

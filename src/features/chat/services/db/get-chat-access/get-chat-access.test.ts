import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { getChatAccess } from "./get-chat-access";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getChatAccess", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when chatId is invalid", async () => {
        await expect(
            getChatAccess({ chatId: "not-a-uuid" as any, userId }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            getChatAccess({ chatId, userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("returns access denied when chat not found", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    or: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await getChatAccess({ chatId, userId });

        expect(result.allowed).toBe(false);
        expect(result.chatFound).toBe(false);
        expect(result.isOwner).toBe(false);
        expect(result.isPrivate).toBe(false);
        expect(result.isPublic).toBe(false);
        expect(result).not.toHaveProperty("visibility");
    });

    it("returns access allowed when user is owner of private chat", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    or: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                id: chatId,
                                visibility: CHAT_VISIBILITY.PRIVATE,
                                userId,
                            },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await getChatAccess({ chatId, userId });

        expect(result.allowed).toBe(true);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(true);
        expect(result.isPrivate).toBe(true);
        expect(result.isPublic).toBe(false);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("returns access allowed when user is owner of public chat", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    or: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                id: chatId,
                                visibility: CHAT_VISIBILITY.PUBLIC,
                                userId,
                            },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await getChatAccess({ chatId, userId });

        expect(result.allowed).toBe(true);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(true);
        expect(result.isPrivate).toBe(false);
        expect(result.isPublic).toBe(true);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("returns access denied when user is not owner of private chat", async () => {
        const otherUserId = "00000000-0000-0000-0000-000000000def" as DBUserId;

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    or: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                id: chatId,
                                visibility: CHAT_VISIBILITY.PRIVATE,
                                userId: otherUserId,
                            },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await getChatAccess({ chatId, userId });

        expect(result.allowed).toBe(false);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(false);
        expect(result.isPrivate).toBe(true);
        expect(result.isPublic).toBe(false);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });

    it("returns access allowed when user is not owner of public chat", async () => {
        const otherUserId = "00000000-0000-0000-0000-000000000def" as DBUserId;

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    or: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({
                            data: {
                                id: chatId,
                                visibility: CHAT_VISIBILITY.PUBLIC,
                                userId: otherUserId,
                            },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await getChatAccess({ chatId, userId });

        expect(result.allowed).toBe(true);
        expect(result.chatFound).toBe(true);
        expect(result.isOwner).toBe(false);
        expect(result.isPrivate).toBe(false);
        expect(result.isPublic).toBe(true);
        expect(result.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });
});

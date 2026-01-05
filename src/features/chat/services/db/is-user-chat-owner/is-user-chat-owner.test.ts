import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { isUserChatOwner } from "./is-user-chat-owner";

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

describe("isUserChatOwner", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when chatId is invalid", async () => {
        await expect(
            isUserChatOwner({ chatId: "not-a-uuid" as any, userId }),
        ).rejects.toThrow();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            isUserChatOwner({ chatId, userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("should return true when user is owner", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: chatId },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await isUserChatOwner({ chatId, userId });

        expect(result).toBe(true);
    });

    it("should throw when user is not owner", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { code: "PGRST116", message: "not found" },
                        }),
                    }),
                }),
            }),
        });

        await expect(isUserChatOwner({ chatId, userId })).rejects.toThrow(
            "Failed to check chat ownership",
        );
    });

    it("should throw on other database errors", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "fail" },
                        }),
                    }),
                }),
            }),
        });

        await expect(isUserChatOwner({ chatId, userId })).rejects.toThrow(
            "Failed to check chat ownership",
        );
    });
});

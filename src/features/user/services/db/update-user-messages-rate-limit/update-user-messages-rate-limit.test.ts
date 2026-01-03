import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { updateUserMessagesRateLimit } from "./update-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("updateUserMessagesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws for invalid userId", async () => {
        await expect(
            updateUserMessagesRateLimit({
                userId: "not-a-uuid" as any,
                updates: { messagesCounter: 1 },
            }),
        ).rejects.toThrow();
    });

    it("returns updated rate limit", async () => {
        const mockRow = {
            id: "r1",
            userId,
            messagesCounter: 2,
            tokensCounter: 10,
            isOverLimit: false,
            updatedAt: new Date().toISOString(),
        };

        mocks.from.mockReturnValue({
            update: mocks.update.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    select: mocks.select.mockReturnValue({
                        single: mocks.single.mockResolvedValue({
                            data: mockRow,
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const result = await updateUserMessagesRateLimit({
            userId,
            updates: { messagesCounter: 2, tokensCounter: 10 },
        });

        expect(result).toEqual(mockRow);
    });

    it("throws when update fails", async () => {
        mocks.from.mockReturnValue({
            update: mocks.update.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    select: mocks.select.mockReturnValue({
                        single: mocks.single.mockResolvedValue({
                            data: null,
                            error: { message: "fail" },
                        }),
                    }),
                }),
            }),
        });

        await expect(
            updateUserMessagesRateLimit({
                userId,
                updates: { messagesCounter: 1 },
            }),
        ).rejects.toThrow("fail");
    });
});

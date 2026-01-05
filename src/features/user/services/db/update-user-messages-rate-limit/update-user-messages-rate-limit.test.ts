import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateUserMessagesRateLimit } from "./update-user-messages-rate-limit";

const userId = generateUserId();

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

    it("should throw for invalid userId", async () => {
        await expect(
            updateUserMessagesRateLimit({
                userId: "not-a-uuid" as any,
                updates: { messagesCounter: 1 },
            }),
        ).rejects.toThrow();
    });

    it("should return updated rate limit", async () => {
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

    it("should throw when update fails", async () => {
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

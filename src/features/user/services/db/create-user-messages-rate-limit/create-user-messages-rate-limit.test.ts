import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { createUserMessagesRateLimit } from "./create-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("createUserMessagesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            createUserMessagesRateLimit({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("creates rate limit row", async () => {
        const mockRow = {
            userId,
            id: "r1",
            messagesCounter: 0,
            tokensCounter: 0,
            isOverLimit: false,
        };

        mocks.from.mockReturnValue({
            insert: mocks.insert.mockReturnValue({
                select: mocks.select.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: mockRow,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await createUserMessagesRateLimit({
            userId,
        });

        expect(result).toEqual(mockRow);
    });

    it("throws on supabase error", async () => {
        mocks.from.mockReturnValue({
            insert: mocks.insert.mockReturnValue({
                select: mocks.select.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        });

        await expect(createUserMessagesRateLimit({ userId })).rejects.toThrow(
            "fail",
        );
    });
});

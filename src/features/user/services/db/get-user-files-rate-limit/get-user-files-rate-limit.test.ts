import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserFilesRateLimit } from "./get-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getUserFilesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws for invalid userId", async () => {
        await expect(
            getUserFilesRateLimit({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("returns rate limit on success", async () => {
        const mockRow = {
            id: "r1",
            userId,
            filesCounter: 0,
            isOverLimit: false,
        };

        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: mockRow,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await getUserFilesRateLimit({ userId });

        expect(result).toEqual(mockRow);
    });

    it("returns null when record does not exist", async () => {
        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { code: "PGRST116" },
                    }),
                }),
            }),
        });

        const result = await getUserFilesRateLimit({ userId });

        expect(result).toBeNull();
    });

    it("throws on other errors", async () => {
        mocks.from.mockReturnValue({
            select: mocks.select.mockReturnValue({
                eq: mocks.eq.mockReturnValue({
                    single: mocks.single.mockResolvedValue({
                        data: null,
                        error: { code: "XX", message: "fail" },
                    }),
                }),
            }),
        });

        await expect(getUserFilesRateLimit({ userId })).rejects.toThrow("fail");
    });
});

import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUserFilesRateLimit } from "./get-user-files-rate-limit";

const userId = generateUserId();

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

    it("should throw for invalid userId", async () => {
        await expect(
            getUserFilesRateLimit({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("should return rate limit on success", async () => {
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

    it("should return null when record does not exist", async () => {
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

    it("should throw on other errors", async () => {
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

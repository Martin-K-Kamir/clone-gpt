import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateUserFilesRateLimit } from "./update-user-files-rate-limit";

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

describe("updateUserFilesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw for invalid userId", async () => {
        await expect(
            updateUserFilesRateLimit({
                userId: "not-a-uuid" as any,
                updates: { filesCounter: 1 },
            }),
        ).rejects.toThrow();
    });

    it("should return updated rate limit", async () => {
        const mockRow = {
            id: "r1",
            userId,
            filesCounter: 5,
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

        const result = await updateUserFilesRateLimit({
            userId,
            updates: { filesCounter: 5 },
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
            updateUserFilesRateLimit({
                userId,
                updates: { filesCounter: 1 },
            }),
        ).rejects.toThrow("fail");
    });
});

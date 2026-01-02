import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { updateUserFilesRateLimit } from "./update-user-files-rate-limit";

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

describe("updateUserFilesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws for invalid userId", async () => {
        await expect(
            updateUserFilesRateLimit({
                userId: "not-a-uuid" as any,
                updates: { filesCounter: 1 },
            }),
        ).rejects.toThrow();
    });

    it("returns updated row on success", async () => {
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

    it("throws on supabase error", async () => {
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

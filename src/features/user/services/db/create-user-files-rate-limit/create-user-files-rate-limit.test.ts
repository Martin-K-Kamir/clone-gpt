import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUserFilesRateLimit } from "./create-user-files-rate-limit";

const userId = generateUserId();

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

describe("createUserFilesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            createUserFilesRateLimit({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("should create rate limit", async () => {
        const mockRow = {
            userId,
            id: "r1",
            filesCounter: 0,
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

        const result = await createUserFilesRateLimit({
            userId,
        });

        expect(result).toEqual(mockRow);
    });

    it("should throw when creation fails", async () => {
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

        await expect(createUserFilesRateLimit({ userId })).rejects.toThrow(
            "fail",
        );
    });
});

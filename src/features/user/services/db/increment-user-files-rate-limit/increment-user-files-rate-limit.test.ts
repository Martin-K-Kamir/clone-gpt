import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { incrementUserFilesRateLimit } from "./increment-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    getUserFilesRateLimit: vi.fn(),
    createUserFilesRateLimit: vi.fn(),
    updateUserFilesRateLimit: vi.fn(),
}));

vi.mock("@/features/user/services/db/get-user-files-rate-limit", () => ({
    getUserFilesRateLimit: mocks.getUserFilesRateLimit,
}));

vi.mock("@/features/user/services/db/create-user-files-rate-limit", () => ({
    createUserFilesRateLimit: mocks.createUserFilesRateLimit,
}));

vi.mock("@/features/user/services/db/update-user-files-rate-limit", () => ({
    updateUserFilesRateLimit: mocks.updateUserFilesRateLimit,
}));

describe("incrementUserFilesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws for invalid userId", async () => {
        await expect(
            incrementUserFilesRateLimit({
                userId: "not-a-uuid" as any,
                increments: { files: 1 },
            }),
        ).rejects.toThrow();
    });

    it("increments file count for new user", async () => {
        mocks.getUserFilesRateLimit.mockResolvedValue(null);
        mocks.createUserFilesRateLimit.mockResolvedValue(undefined);
        mocks.updateUserFilesRateLimit.mockResolvedValue(undefined);

        await incrementUserFilesRateLimit({ userId, increments: { files: 2 } });

        expect(mocks.createUserFilesRateLimit).toHaveBeenCalledWith({ userId });
        expect(mocks.updateUserFilesRateLimit).toHaveBeenCalledWith({
            userId,
            updates: { filesCounter: 2 },
        });
    });

    it("increments file count from existing value", async () => {
        mocks.getUserFilesRateLimit.mockResolvedValue({
            filesCounter: 5,
        });
        mocks.updateUserFilesRateLimit.mockResolvedValue(undefined);

        await incrementUserFilesRateLimit({ userId, increments: { files: 3 } });

        expect(mocks.createUserFilesRateLimit).not.toHaveBeenCalled();
        expect(mocks.updateUserFilesRateLimit).toHaveBeenCalledWith({
            userId,
            updates: { filesCounter: 8 },
        });
    });
});

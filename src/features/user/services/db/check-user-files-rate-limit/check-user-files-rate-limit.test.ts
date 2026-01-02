import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import type { DBUserId } from "@/features/user/lib/types";

import { RATE_LIMIT_REASON } from "@/lib/constants";

import { checkUserFilesRateLimit } from "./check-user-files-rate-limit";

const mocks = vi.hoisted(() => ({
    mockGetUserById: vi.fn(),
    mockGetUserFilesRateLimit: vi.fn(),
    mockCreateUserFilesRateLimit: vi.fn(),
    mockUpdateUserFilesRateLimit: vi.fn(),
}));

vi.mock("@/features/user/services/db/get-user-by-id", () => ({
    getUserById: mocks.mockGetUserById,
}));
vi.mock("@/features/user/services/db/get-user-files-rate-limit", () => ({
    getUserFilesRateLimit: mocks.mockGetUserFilesRateLimit,
}));
vi.mock("@/features/user/services/db/create-user-files-rate-limit", () => ({
    createUserFilesRateLimit: mocks.mockCreateUserFilesRateLimit,
}));
vi.mock("@/features/user/services/db/update-user-files-rate-limit", () => ({
    updateUserFilesRateLimit: mocks.mockUpdateUserFilesRateLimit,
}));

(entitlementsByUserRole as any).user.maxFiles = 1;

const userId = "00000000-0000-0000-0000-000000000999" as DBUserId;
const baseRateLimit = {
    filesCounter: 0,
    isOverLimit: false,
    periodStart: null,
    periodEnd: null,
    updatedAt: new Date().toISOString(),
};

describe("checkUserFilesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.mockGetUserById.mockResolvedValue({ id: userId, role: "user" });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("creates a rate limit row when missing", async () => {
        mocks.mockGetUserFilesRateLimit.mockResolvedValue(null);
        mocks.mockCreateUserFilesRateLimit.mockResolvedValue(baseRateLimit);

        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(false);
    });

    it("returns over-limit with reason when filesCounter >= maxFiles", async () => {
        mocks.mockGetUserFilesRateLimit.mockResolvedValue({
            ...baseRateLimit,
            filesCounter: entitlementsByUserRole.user.maxFiles,
        });

        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe(RATE_LIMIT_REASON.FILES);
        }
    });

    it("resets counters when more than 24h has passed", async () => {
        const past = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
        mocks.mockGetUserFilesRateLimit.mockResolvedValue({
            ...baseRateLimit,
            updatedAt: past,
            filesCounter: 5,
        });

        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(false);
        expect(result.filesCounter).toBe(5);
    });
});

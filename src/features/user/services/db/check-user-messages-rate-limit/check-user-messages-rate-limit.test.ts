import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { RATE_LIMIT_REASON } from "@/lib/constants";

import { checkUserMessagesRateLimit } from "./check-user-messages-rate-limit";

const mocks = vi.hoisted(() => ({
    mockGetUserById: vi.fn(),
    mockGetUserMessagesRateLimit: vi.fn(),
    mockCreateUserMessagesRateLimit: vi.fn(),
    mockUpdateUserMessagesRateLimit: vi.fn(),
}));

vi.mock("@/features/user/services/db/get-user-by-id", () => ({
    getUserById: mocks.mockGetUserById,
}));
vi.mock("@/features/user/services/db/get-user-messages-rate-limit", () => ({
    getUserMessagesRateLimit: mocks.mockGetUserMessagesRateLimit,
}));
vi.mock("@/features/user/services/db/create-user-messages-rate-limit", () => ({
    createUserMessagesRateLimit: mocks.mockCreateUserMessagesRateLimit,
}));
vi.mock("@/features/user/services/db/update-user-messages-rate-limit", () => ({
    updateUserMessagesRateLimit: mocks.mockUpdateUserMessagesRateLimit,
}));

(entitlementsByUserRole as any).user.maxMessages = 1;
(entitlementsByUserRole as any).user.maxTokens = 1;

const userId = generateUserId();
const baseRateLimit = {
    messagesCounter: 0,
    tokensCounter: 0,
    isOverLimit: false,
    periodStart: null,
    periodEnd: null,
    updatedAt: new Date().toISOString(),
};

describe("checkUserMessagesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.mockGetUserById.mockResolvedValue({
            id: userId,
            role: USER_ROLE.USER,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should create a rate limit row when missing", async () => {
        mocks.mockGetUserMessagesRateLimit.mockResolvedValue(null);
        mocks.mockCreateUserMessagesRateLimit.mockResolvedValue(baseRateLimit);

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(false);
    });

    it("should flag over-limit by messages", async () => {
        mocks.mockGetUserMessagesRateLimit.mockResolvedValue({
            ...baseRateLimit,
            messagesCounter: entitlementsByUserRole.user.maxMessages,
        });

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe(RATE_LIMIT_REASON.MESSAGES);
        }
    });

    it("should flag over-limit by tokens", async () => {
        mocks.mockGetUserMessagesRateLimit.mockResolvedValue({
            ...baseRateLimit,
            tokensCounter: entitlementsByUserRole.user.maxTokens,
        });

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe(RATE_LIMIT_REASON.TOKENS);
        }
    });

    it("should reset counters when more than 24h has passed", async () => {
        const past = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
        mocks.mockGetUserMessagesRateLimit.mockResolvedValue({
            ...baseRateLimit,
            updatedAt: past,
            messagesCounter: 5,
            tokensCounter: 5,
        });

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(false);
        expect(result.messagesCounter).toBe(5);
        expect(result.tokensCounter).toBe(5);
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { incrementUserMessagesRateLimit } from "./increment-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    getUserMessagesRateLimit: vi.fn(),
    createUserMessagesRateLimit: vi.fn(),
    updateUserMessagesRateLimit: vi.fn(),
}));

vi.mock("@/features/user/services/db/get-user-messages-rate-limit", () => ({
    getUserMessagesRateLimit: mocks.getUserMessagesRateLimit,
}));

vi.mock("@/features/user/services/db/create-user-messages-rate-limit", () => ({
    createUserMessagesRateLimit: mocks.createUserMessagesRateLimit,
}));

vi.mock("@/features/user/services/db/update-user-messages-rate-limit", () => ({
    updateUserMessagesRateLimit: mocks.updateUserMessagesRateLimit,
}));

describe("incrementUserMessagesRateLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws for invalid userId", async () => {
        await expect(
            incrementUserMessagesRateLimit({
                userId: "not-a-uuid" as any,
                increments: { messages: 1 },
            }),
        ).rejects.toThrow();
    });

    it("creates rate limit when missing and increments from zero", async () => {
        mocks.getUserMessagesRateLimit.mockResolvedValue(null);
        mocks.createUserMessagesRateLimit.mockResolvedValue(undefined);
        mocks.updateUserMessagesRateLimit.mockResolvedValue(undefined);

        await incrementUserMessagesRateLimit({
            userId,
            increments: { messages: 2, tokens: 10 },
        });

        expect(mocks.createUserMessagesRateLimit).toHaveBeenCalledWith({
            userId,
        });
        expect(mocks.updateUserMessagesRateLimit).toHaveBeenCalledWith({
            userId,
            updates: { messagesCounter: 2, tokensCounter: 10 },
        });
    });

    it("increments from existing counters", async () => {
        mocks.getUserMessagesRateLimit.mockResolvedValue({
            messagesCounter: 5,
            tokensCounter: 50,
        });
        mocks.updateUserMessagesRateLimit.mockResolvedValue(undefined);

        await incrementUserMessagesRateLimit({
            userId,
            increments: { messages: 3, tokens: 20 },
        });

        expect(mocks.createUserMessagesRateLimit).not.toHaveBeenCalled();
        expect(mocks.updateUserMessagesRateLimit).toHaveBeenCalledWith({
            userId,
            updates: { messagesCounter: 8, tokensCounter: 70 },
        });
    });
});

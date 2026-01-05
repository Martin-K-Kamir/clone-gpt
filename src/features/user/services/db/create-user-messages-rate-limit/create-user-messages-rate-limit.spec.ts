import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { createUserMessagesRateLimit } from "./create-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("createUserMessagesRateLimit", () => {
    it("should create rate limit for user", async () => {
        const rate = await createUserMessagesRateLimit({ userId });

        expect(rate).not.toBeNull();
        expect(rate?.userId).toBe(userId);
        expect(rate?.messagesCounter).toBe(0);
        expect(rate?.tokensCounter).toBe(0);
        expect(rate?.isOverLimit).toBe(false);
        expect(rate?.id).toBeTruthy();
    });
});

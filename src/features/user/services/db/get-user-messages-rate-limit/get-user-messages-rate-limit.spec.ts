import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserMessagesRateLimit } from "./get-user-messages-rate-limit";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserMessagesRateLimit", () => {
    it("should return rate limit for existing user", async () => {
        const row = await getUserMessagesRateLimit({ userId: seededUserId });

        expect(row).not.toBeNull();
        expect(row?.userId).toBe(seededUserId);
        expect(row?.messagesCounter).toBe(0);
        expect(row?.tokensCounter).toBe(0);
        expect(row?.isOverLimit).toBe(false);
    });

    it("should return null for non-existent user", async () => {
        const row = await getUserMessagesRateLimit({ userId: missingUserId });

        expect(row).toBeNull();
    });
});

import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId } from "@/features/user/lib/types";

import { checkUserMessagesRateLimit } from "./check-user-messages-rate-limit";

const entitlements = entitlementsByUserRole.user;

describe("checkUserMessagesRateLimit", () => {
    it("should return under-limit status when counters are below thresholds", async () => {
        const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(false);
        expect(result.messagesCounter).toBe(0);
        expect(result.tokensCounter).toBe(0);
    });

    it("should return over-limit status when message threshold exceeded", async () => {
        const userId = "00000000-0000-0000-0000-000000000002" as DBUserId;

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe("messages");
        }
        expect(result.messagesCounter).toBeGreaterThanOrEqual(
            entitlements.maxMessages || 100,
        );
    });

    it("should return over-limit status when token threshold exceeded", async () => {
        const userId = "00000000-0000-0000-0000-000000000011" as DBUserId;

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: USER_ROLE.USER,
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe("tokens");
        }
        expect(result.tokensCounter).toBeGreaterThanOrEqual(
            entitlements.maxTokens || 10000,
        );
    });
});

import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { checkUserMessagesRateLimit } from "./check-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000011" as DBUserId;
const entitlements = entitlementsByUserRole.user;

describe("checkUserMessagesRateLimit", () => {
    beforeAll(() => {
        (entitlementsByUserRole as any).user.maxMessages = 1;
        (entitlementsByUserRole as any).user.maxTokens = 1;
    });

    beforeEach(async () => {
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);
        await supabase.from("user_messages_rate_limits").insert({
            userId,
            messagesCounter: 0,
            tokensCounter: 0,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });
    });

    it("returns under-limit status when counters are below thresholds", async () => {
        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: "user",
        });
        expect(result.isOverLimit).toBe(false);
        expect(result.messagesCounter).toBe(0);
        expect(result.tokensCounter).toBe(0);
    });

    it("flags over-limit by messages when messagesCounter >= maxMessages", async () => {
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);
        await supabase.from("user_messages_rate_limits").insert({
            userId,
            messagesCounter: entitlements.maxMessages,
            tokensCounter: 0,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe("messages");
        }
        expect(result.messagesCounter).toBe(entitlements.maxMessages);
    });

    it("flags over-limit by tokens when tokensCounter >= maxTokens", async () => {
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);
        await supabase.from("user_messages_rate_limits").insert({
            userId,
            messagesCounter: 0,
            tokensCounter: entitlements.maxTokens,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });

        const result = await checkUserMessagesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe("tokens");
        }
        expect(result.tokensCounter).toBe(entitlements.maxTokens);
    });
});

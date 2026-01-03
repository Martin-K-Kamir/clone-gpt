import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateUserMessagesRateLimit } from "./update-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000031" as DBUserId;

describe("updateUserMessagesRateLimit", () => {
    it("updates rate limit status", async () => {
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
        });

        await updateUserMessagesRateLimit({
            userId,
            updates: {
                messagesCounter: 7,
                tokensCounter: 42,
                isOverLimit: true,
            },
        });

        const { data } = await supabase
            .from("user_messages_rate_limits")
            .select("messagesCounter, tokensCounter, isOverLimit")
            .eq("userId", userId)
            .single();

        expect(data?.messagesCounter).toBe(7);
        expect(data?.tokensCounter).toBe(42);
        expect(data?.isOverLimit).toBe(true);
    });
});

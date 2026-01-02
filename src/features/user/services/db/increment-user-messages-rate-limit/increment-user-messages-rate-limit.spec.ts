import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { incrementUserMessagesRateLimit } from "./increment-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000021" as DBUserId;

describe("incrementUserMessagesRateLimit", () => {
    beforeEach(async () => {
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);
    });

    it("creates row when missing and increments counters", async () => {
        await incrementUserMessagesRateLimit({
            userId,
            increments: { messages: 2, tokens: 10 },
        });

        const { data } = await supabase
            .from("user_messages_rate_limits")
            .select("messagesCounter, tokensCounter")
            .eq("userId", userId)
            .single();

        expect(data?.messagesCounter).toBe(2);
        expect(data?.tokensCounter).toBe(10);
    });

    it("increments existing counters", async () => {
        await supabase.from("user_messages_rate_limits").insert({
            userId,
            messagesCounter: 5,
            tokensCounter: 50,
            isOverLimit: false,
        });

        await incrementUserMessagesRateLimit({
            userId,
            increments: { messages: 3, tokens: 20 },
        });

        const { data } = await supabase
            .from("user_messages_rate_limits")
            .select("messagesCounter, tokensCounter")
            .eq("userId", userId)
            .single();

        expect(data?.messagesCounter).toBe(8);
        expect(data?.tokensCounter).toBe(70);
    });
});

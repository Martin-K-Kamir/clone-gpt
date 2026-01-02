import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { createUserMessagesRateLimit } from "./create-user-messages-rate-limit";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("createUserMessagesRateLimit", () => {
    beforeEach(async () => {
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);
    });

    it("creates a messages rate limit row for the user", async () => {
        const rate = await createUserMessagesRateLimit({ userId });

        expect(rate).toBeTruthy();
        expect(rate?.userId).toBe(userId);
        expect(rate?.messagesCounter).toBe(0);
        expect(rate?.tokensCounter).toBe(0);
        expect(rate?.isOverLimit).toBe(false);
        expect(rate?.id).toBeTruthy();
    });
});

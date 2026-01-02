import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { getUserMessagesRateLimit } from "./get-user-messages-rate-limit";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserMessagesRateLimit", () => {
    it("returns seeded rate limit row", async () => {
        // Seed data should be restored by global beforeEach
        // Wait longer for restore to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Ensure rate limit exists - delete first, then insert to ensure clean state
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", seededUserId);

        const { error: insertError } = await supabase
            .from("user_messages_rate_limits")
            .insert({
                id: "22222222-0000-0000-0000-000000000001",
                userId: seededUserId,
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            });

        if (insertError) {
            console.error("Insert error:", insertError);
        }

        // Wait longer for insert to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify row exists directly in database first
        let dbRow = (
            await supabase
                .from("user_messages_rate_limits")
                .select("*")
                .eq("userId", seededUserId)
                .single()
        ).data;

        // If not found in DB, retry insert
        if (!dbRow) {
            await supabase.from("user_messages_rate_limits").insert({
                id: "22222222-0000-0000-0000-000000000001",
                userId: seededUserId,
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Verify it exists using the function, retry if needed
        let row = await getUserMessagesRateLimit({ userId: seededUserId });
        let retries = 0;

        while (!row && retries < 15) {
            await new Promise(resolve => setTimeout(resolve, 300));
            row = await getUserMessagesRateLimit({
                userId: seededUserId,
            });
            retries++;
        }

        expect(row).not.toBeNull();
        expect(row?.userId).toBe(seededUserId);
        expect(row?.messagesCounter).toBe(0);
        expect(row?.tokensCounter).toBe(0);
        expect(row?.isOverLimit).toBe(false);
    });

    it("returns null for missing user", async () => {
        const row = await getUserMessagesRateLimit({ userId: missingUserId });
        expect(row).toBeNull();
    });
});

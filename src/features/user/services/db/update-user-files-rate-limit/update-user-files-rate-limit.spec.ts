import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateUserFilesRateLimit } from "./update-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000030" as DBUserId;

describe("updateUserFilesRateLimit", () => {
    beforeEach(async () => {
        await supabase
            .from("user_files_rate_limits")
            .delete()
            .eq("userId", userId);
        await supabase.from("user_files_rate_limits").insert({
            userId,
            filesCounter: 0,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });
    });

    it("updates filesCounter and isOverLimit", async () => {
        await updateUserFilesRateLimit({
            userId,
            updates: { filesCounter: 5, isOverLimit: true },
        });

        const { data } = await supabase
            .from("user_files_rate_limits")
            .select("filesCounter, isOverLimit")
            .eq("userId", userId)
            .single();

        expect(data?.filesCounter).toBe(5);
        expect(data?.isOverLimit).toBe(true);
    });
});

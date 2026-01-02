import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { incrementUserFilesRateLimit } from "./increment-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000020" as DBUserId;

describe("incrementUserFilesRateLimit", () => {
    beforeEach(async () => {
        await supabase
            .from("user_files_rate_limits")
            .delete()
            .eq("userId", userId);
    });

    it("creates row when missing and increments files", async () => {
        await incrementUserFilesRateLimit({
            userId,
            increments: { files: 2 },
        });

        const { data } = await supabase
            .from("user_files_rate_limits")
            .select("filesCounter")
            .eq("userId", userId)
            .single();

        expect(data?.filesCounter).toBe(2);
    });

    it("increments existing counters", async () => {
        await supabase.from("user_files_rate_limits").insert({
            userId,
            filesCounter: 3,
            isOverLimit: false,
        });

        await incrementUserFilesRateLimit({
            userId,
            increments: { files: 4 },
        });

        const { data } = await supabase
            .from("user_files_rate_limits")
            .select("filesCounter")
            .eq("userId", userId)
            .single();

        expect(data?.filesCounter).toBe(7);
    });
});

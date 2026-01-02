import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { createUserFilesRateLimit } from "./create-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("createUserFilesRateLimit", () => {
    beforeEach(async () => {
        await supabase
            .from("user_files_rate_limits")
            .delete()
            .eq("userId", userId);
    });

    it("creates a files rate limit row for the user", async () => {
        const rate = await createUserFilesRateLimit({ userId });

        expect(rate).toBeTruthy();
        expect(rate?.userId).toBe(userId);
        expect(rate?.filesCounter).toBe(0);
        expect(rate?.isOverLimit).toBe(false);
        expect(rate?.id).toBeTruthy();
    });
});

import { beforeEach, describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { getUserFilesRateLimit } from "./get-user-files-rate-limit";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserFilesRateLimit ", () => {
    beforeEach(async () => {
        await supabase
            .from("user_files_rate_limits")
            .update({
                filesCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                updatedAt: new Date().toISOString(),
            })
            .eq("userId", seededUserId);
    });

    it("returns seeded rate limit row", async () => {
        const row = await getUserFilesRateLimit({ userId: seededUserId });

        expect(row).not.toBeNull();
        expect(row?.userId).toBe(seededUserId);
        expect(row?.filesCounter).toBe(0);
        expect(row?.isOverLimit).toBe(false);
    });

    it("returns null for missing user", async () => {
        const row = await getUserFilesRateLimit({ userId: missingUserId });
        expect(row).toBeNull();
    });
});

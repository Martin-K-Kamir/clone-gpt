import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { checkUserFilesRateLimit } from "./check-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000010" as DBUserId;
const entitlements = entitlementsByUserRole.user;

describe("checkUserFilesRateLimit", () => {
    beforeAll(() => {
        (entitlementsByUserRole as any).user.maxFiles = 1;
    });

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

    it("returns under-limit status when below maxFiles", async () => {
        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });
        expect(result.isOverLimit).toBe(false);
        expect(result.filesCounter).toBe(0);
    });

    it("flags over-limit when filesCounter >= maxFiles", async () => {
        await supabase
            .from("user_files_rate_limits")
            .delete()
            .eq("userId", userId);
        await supabase.from("user_files_rate_limits").insert({
            userId,
            filesCounter: entitlements.maxFiles,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });

        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe("files");
        }
        expect(result.filesCounter).toBe(entitlements.maxFiles);
    });
});

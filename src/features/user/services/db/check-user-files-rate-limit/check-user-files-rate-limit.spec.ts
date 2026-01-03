import { describe, expect, it } from "vitest";

import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import type { DBUserId } from "@/features/user/lib/types";

import { checkUserFilesRateLimit } from "./check-user-files-rate-limit";

const entitlements = entitlementsByUserRole.user;

describe("checkUserFilesRateLimit", () => {
    it("returns under-limit status when below maxFiles", async () => {
        const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(false);
        expect(result.filesCounter).toBe(0);
    });

    it("returns over-limit status when threshold exceeded", async () => {
        const userId = "00000000-0000-0000-0000-000000000010" as DBUserId;

        const result = await checkUserFilesRateLimit({
            userId,
            userRole: "user",
        });

        expect(result.isOverLimit).toBe(true);
        if (result.isOverLimit) {
            expect(result.reason).toBe("files");
        }
        expect(result.filesCounter).toBeGreaterThanOrEqual(
            entitlements.maxFiles || 10,
        );
    });
});

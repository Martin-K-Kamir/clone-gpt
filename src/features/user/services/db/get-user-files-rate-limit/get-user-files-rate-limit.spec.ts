import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserFilesRateLimit } from "./get-user-files-rate-limit";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserFilesRateLimit", () => {
    it("returns rate limit for existing user", async () => {
        const row = await getUserFilesRateLimit({ userId: seededUserId });

        expect(row).not.toBeNull();
        expect(row?.userId).toBe(seededUserId);
        expect(row?.filesCounter).toBe(0);
        expect(row?.isOverLimit).toBe(false);
    });

    it("returns null for non-existent user", async () => {
        const row = await getUserFilesRateLimit({ userId: missingUserId });

        expect(row).toBeNull();
    });
});

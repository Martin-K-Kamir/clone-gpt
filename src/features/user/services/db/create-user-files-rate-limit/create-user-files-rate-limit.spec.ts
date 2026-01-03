import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { createUserFilesRateLimit } from "./create-user-files-rate-limit";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("createUserFilesRateLimit", () => {
    it("creates a files rate limit row for the user", async () => {
        const rate = await createUserFilesRateLimit({ userId });

        expect(rate).not.toBeNull();
        expect(rate?.userId).toBe(userId);
        expect(rate?.filesCounter).toBe(0);
        expect(rate?.isOverLimit).toBe(false);
        expect(rate?.id).toBeTruthy();
    });
});

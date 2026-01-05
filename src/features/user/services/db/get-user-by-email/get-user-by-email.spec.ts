import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserByEmail } from "./get-user-by-email";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const seededEmail = "seed-user1@example.com";

describe("getUserByEmail", () => {
    it("should return the seeded user by email", async () => {
        const user = await getUserByEmail({ email: seededEmail });

        expect(user).not.toBeNull();
        expect(user?.id).toBe(seededUserId);
        expect(user?.email).toBe(seededEmail);
    });

    it("should return null for non-existent email", async () => {
        const user = await getUserByEmail({ email: "no-such@example.com" });
        expect(user).toBeNull();
    });
});

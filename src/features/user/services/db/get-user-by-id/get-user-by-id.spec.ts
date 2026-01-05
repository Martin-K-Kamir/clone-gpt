import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserById } from "./get-user-by-id";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const seededEmail = "seed-user1@example.com";
const seededName = "Seed User 1";

describe("getUserById", () => {
    it("should fetch the seeded user by ID", async () => {
        const user = await getUserById({ userId: seededUserId });
        expect(user).not.toBeNull();
        expect(user?.id).toBe(seededUserId);
        expect(user?.email).toBe(seededEmail);
        expect(user?.name).toBe(seededName);
    });

    it("should throw an error for a non-existent user", async () => {
        await expect(
            getUserById({
                userId: "00000000-0000-0000-0000-000000000000" as DBUserId,
            }),
        ).rejects.toThrow("Failed to fetch user by ID");
    });
});

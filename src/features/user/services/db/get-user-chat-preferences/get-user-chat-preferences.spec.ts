import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserChatPreferences } from "./get-user-chat-preferences";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserChatPreferences", () => {
    it("returns seeded preferences for existing user", async () => {
        const prefs = await getUserChatPreferences({ userId: seededUserId });

        expect(prefs).not.toBeNull();
        expect(prefs?.userId).toBe(seededUserId);
        expect(prefs?.personality).toBe("FRIENDLY");
        expect(prefs?.nickname).toBe("Alpha");
    });

    it("returns null for missing user", async () => {
        const prefs = await getUserChatPreferences({ userId: missingUserId });
        expect(prefs).toBeNull();
    });
});

import { describe, expect, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants/ai";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserChatPreferences } from "./get-user-chat-preferences";

const seededUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserChatPreferences", () => {
    it("should return seeded preferences for existing user", async () => {
        const prefs = await getUserChatPreferences({ userId: seededUserId });

        expect(prefs).not.toBeNull();
        expect(prefs?.userId).toBe(seededUserId);
        expect(prefs?.personality).toBe(AI_PERSONALITIES.FRIENDLY.id);
        expect(prefs?.nickname).toBe("Alpha");
    });

    it("should return null for missing user", async () => {
        const prefs = await getUserChatPreferences({ userId: missingUserId });
        expect(prefs).toBeNull();
    });
});

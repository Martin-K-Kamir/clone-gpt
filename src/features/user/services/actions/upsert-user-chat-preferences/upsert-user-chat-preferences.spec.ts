import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { upsertUserChatPreferences } from "./upsert-user-chat-preferences";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000125" as DBUserId,
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: constants.userId } }),
}));

vi.mock("@/features/auth/lib/asserts", () => ({
    assertSessionExists: vi.fn(),
}));

vi.mock("@/features/user/lib/asserts", () => ({
    assertIsDBUserId: vi.fn(),
    assertIsUserChatPreferences: vi.fn(),
}));

describe("upsertUserChatPreferences", () => {
    beforeEach(async () => {
        await supabase
            .from("user_preferences")
            .delete()
            .eq("userId", constants.userId);
        await supabase.from("users").delete().eq("id", constants.userId);
        await supabase.from("users").insert({
            id: constants.userId,
            email: "upsert-prefs@example.com",
            name: "Prefs User",
            role: "user",
        });
    });

    it("inserts preferences when missing, then updates", async () => {
        const first = await upsertUserChatPreferences({
            userChatPreferences: {
                personality: "FRIENDLY",
                nickname: "Alpha",
            } as any,
        });
        expect(first).toBeDefined();

        const { data: afterInsert } = await supabase
            .from("user_preferences")
            .select("personality, nickname")
            .eq("userId", constants.userId)
            .single();
        expect(afterInsert?.nickname).toBe("Alpha");

        const second = await upsertUserChatPreferences({
            userChatPreferences: {
                personality: "NERD",
                nickname: "Beta",
            } as any,
        });
        expect(second).toBeDefined();

        const { data: afterUpdate } = await supabase
            .from("user_preferences")
            .select("personality, nickname")
            .eq("userId", constants.userId)
            .single();
        expect(afterUpdate?.personality).toBe("NERD");
        expect(afterUpdate?.nickname).toBe("Beta");
    });
});

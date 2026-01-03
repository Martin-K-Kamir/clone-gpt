import {
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { upsertUserChatPreferences } from "./upsert-user-chat-preferences";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

describe("upsertUserChatPreferences", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("saves preferences and updates existing ones", async () => {
        const userId = generateUserId() as DBUserId;
        const email = generateUserEmail();

        vi.mocked(auth).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Prefs User",
                image: null,
                role: "user",
            },
        } as any);

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Prefs User",
            role: "user",
        });

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
            .eq("userId", userId)
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
            .eq("userId", userId)
            .single();
        expect(afterUpdate?.personality).toBe("NERD");
        expect(afterUpdate?.nickname).toBe("Beta");
    });
});

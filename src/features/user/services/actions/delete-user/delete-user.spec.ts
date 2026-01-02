import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUser } from "./delete-user";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000123" as DBUserId,
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: constants.userId } }),
}));

vi.mock("@/features/auth/lib/asserts", () => ({
    assertSessionExists: vi.fn(),
}));

vi.mock("@/features/user/lib/asserts", () => ({
    assertIsDBUserId: vi.fn(),
}));

describe("deleteUser", () => {
    beforeEach(async () => {
        await supabase.from("messages").delete().eq("userId", constants.userId);
        await supabase.from("chats").delete().eq("userId", constants.userId);
        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", constants.userId);
        await supabase
            .from("user_files_rate_limits")
            .delete()
            .eq("userId", constants.userId);
        await supabase
            .from("user_preferences")
            .delete()
            .eq("userId", constants.userId);
        await supabase.from("users").delete().eq("id", constants.userId);

        await supabase.from("users").insert({
            id: constants.userId,
            email: "delete-test@example.com",
            name: "Delete Test",
            role: "user",
        });
        await supabase.from("user_preferences").insert({
            userId: constants.userId,
            personality: "FRIENDLY",
            nickname: "Alpha",
        });
        await supabase.from("user_files_rate_limits").insert({
            userId: constants.userId,
            filesCounter: 1,
            isOverLimit: false,
        });
        await supabase.from("user_messages_rate_limits").insert({
            userId: constants.userId,
            messagesCounter: 1,
            tokensCounter: 10,
            isOverLimit: false,
        });
        const { data: chat } = await supabase
            .from("chats")
            .insert({
                id: "30000000-0000-0000-0000-000000000123",
                userId: constants.userId,
                title: "Chat",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();
        await supabase.from("messages").insert({
            id: "40000000-0000-0000-0000-000000000123",
            chatId: chat?.id,
            userId: constants.userId,
            role: "user",
            content: "hello",
            metadata: {},
            parts: [],
        });
    });

    it("removes user and related data", async () => {
        const result = await deleteUser();
        expect(result).toBeDefined();

        const { data: userRow } = await supabase
            .from("users")
            .select("id")
            .eq("id", constants.userId)
            .maybeSingle();
        expect(userRow).toBeNull();

        const [{ count: chatsCount }, { count: messagesCount }] =
            await Promise.all([
                supabase
                    .from("chats")
                    .select("id", { count: "exact", head: true })
                    .eq("userId", constants.userId),
                supabase
                    .from("messages")
                    .select("id", { count: "exact", head: true })
                    .eq("userId", constants.userId),
            ]);

        expect(chatsCount).toBe(0);
        expect(messagesCount).toBe(0);
    });
});

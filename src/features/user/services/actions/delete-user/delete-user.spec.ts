import {
    generateChatId,
    generateMessageId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUser } from "./delete-user";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/auth/lib/asserts", () => ({
    assertSessionExists: vi.fn((session: any) => session),
}));

vi.mock("@/features/user/lib/asserts", () => ({
    assertIsDBUserId: vi.fn((userId: any) => userId),
}));

describe("deleteUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("removes user and related data", async () => {
        const userId = generateUserId() as DBUserId;
        const chatId = generateChatId();
        const messageId = generateMessageId();

        const email = `delete-test-${Date.now()}@example.com`;

        vi.mocked(auth).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Delete Test",
                image: null,
                role: "user",
            },
        } as any);

        // Create user
        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Delete Test",
            role: "user",
        });

        // Create user preferences
        await supabase.from("user_preferences").insert({
            userId,
            personality: "FRIENDLY",
            nickname: "Alpha",
        });

        // Create rate limits
        await supabase.from("user_files_rate_limits").insert({
            userId,
            filesCounter: 1,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("user_messages_rate_limits").insert({
            userId,
            messagesCounter: 1,
            tokensCounter: 10,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            updatedAt: new Date().toISOString(),
        });

        // Create chat
        const { data: chat } = await supabase
            .from("chats")
            .insert({
                id: chatId,
                userId,
                title: "Test Chat",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .select()
            .single();

        // Create message
        await supabase.from("messages").insert({
            id: messageId,
            chatId: chat?.id,
            userId,
            role: "user",
            content: "hello",
            metadata: {},
            parts: [],
        });

        const result = await deleteUser();
        expect(result).toBeDefined();

        const { data: userRow } = await supabase
            .from("users")
            .select("id")
            .eq("id", userId)
            .maybeSingle();
        expect(userRow).toBeNull();

        const [{ count: chatsCount }, { count: messagesCount }] =
            await Promise.all([
                supabase
                    .from("chats")
                    .select("id", { count: "exact", head: true })
                    .eq("userId", userId),
                supabase
                    .from("messages")
                    .select("id", { count: "exact", head: true })
                    .eq("userId", userId),
            ]);

        expect(chatsCount).toBe(0);
        expect(messagesCount).toBe(0);
    });
});

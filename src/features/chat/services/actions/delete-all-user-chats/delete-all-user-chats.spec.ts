import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteAllUserChats } from "./delete-all-user-chats";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteStorageDirectory: vi.fn().mockResolvedValue(undefined),
}));

describe("deleteAllUserChats", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

        const testChatId = "30000000-0000-0000-0000-000000000999" as any;
        await supabase.from("messages").delete().eq("chatId", testChatId);
        await supabase.from("chats").delete().eq("id", testChatId);

        await supabase.from("chats").upsert({
            id: testChatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").upsert({
            id: "40000000-0000-0000-0000-000000000999" as any,
            chatId: testChatId,
            userId,
            role: "user",
            content: "Test message",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });
    });

    it("deletes all user chats and messages", async () => {
        const { data: chatsBefore } = await supabase
            .from("chats")
            .select("id")
            .eq("userId", userId);

        const { data: messagesBefore } = await supabase
            .from("messages")
            .select("id")
            .eq("userId", userId);

        expect(chatsBefore?.length).toBeGreaterThan(0);
        expect(messagesBefore?.length).toBeGreaterThan(0);

        const result = await deleteAllUserChats();

        expect(result.success).toBe(true);

        // Verify test-specific chat and message were deleted
        // Note: seed data may be restored by global hooks, so we only check test-specific IDs
        const { data: testChatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", "30000000-0000-0000-0000-000000000999");

        const { data: testMessageAfter } = await supabase
            .from("messages")
            .select("id")
            .eq("id", "40000000-0000-0000-0000-000000000999");

        // Test-specific data should be deleted
        expect(testChatAfter || []).toHaveLength(0);
        expect(testMessageAfter || []).toHaveLength(0);
    });
});

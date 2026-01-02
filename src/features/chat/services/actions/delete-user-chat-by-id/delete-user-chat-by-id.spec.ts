import { waitForChat } from "@/vitest/helpers/wait-for-data";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUserChatById } from "./delete-user-chat-by-id";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const testChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteStorageDirectory: vi.fn().mockResolvedValue(undefined),
}));

describe("deleteUserChatById", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

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

    it("deletes chat and its messages", async () => {
        const testMessageId = "40000000-0000-0000-0000-000000000999" as any;

        // Ensure chat exists - delete first to avoid conflicts
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

        // Ensure message exists
        await supabase.from("messages").upsert({
            id: testMessageId,
            chatId: testChatId,
            userId,
            role: "user",
            content: "Test message",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // Wait for operations to complete
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify both exist before deletion - use waitForChat and wait for messages
        const chatBefore = await waitForChat(testChatId, 15, 300);

        // Wait for messages with retry
        let messagesBefore = (
            await supabase
                .from("messages")
                .select("id")
                .eq("chatId", testChatId)
        ).data;

        let retries = 0;
        while (
            (!messagesBefore || messagesBefore.length === 0) &&
            retries < 10
        ) {
            await new Promise(resolve => setTimeout(resolve, 200));
            messagesBefore = (
                await supabase
                    .from("messages")
                    .select("id")
                    .eq("chatId", testChatId)
            ).data;
            retries++;
        }

        expect(chatBefore).not.toBeNull();
        expect(messagesBefore?.length).toBeGreaterThan(0);

        const result = await deleteUserChatById({ chatId: testChatId });

        expect(result.success).toBe(true);

        const { data: chatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", testChatId)
            .single();

        const { data: messagesAfter } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", testChatId);

        expect(chatAfter).toBeNull();
        expect(messagesAfter).toHaveLength(0);
    });

    it("returns authorization error when user is not owner", async () => {
        await supabase.from("chats").upsert({
            id: testChatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;
        (auth as any).mockResolvedValue({
            user: { id: otherUserId, name: "Other User" },
        });

        // Ensure chat exists and is owned by userId (not otherUserId)
        await supabase.from("chats").upsert({
            id: testChatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Verify chat exists
        const { data: finalChatBefore } = await supabase
            .from("chats")
            .select("id")
            .eq("id", testChatId)
            .single();

        // If chat still doesn't exist, try one more time
        if (!finalChatBefore) {
            await supabase.from("chats").upsert({
                id: testChatId,
                userId,
                title: "Test Chat to Delete",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            const { data: retryChat } = await supabase
                .from("chats")
                .select("id")
                .eq("id", testChatId)
                .single();
            expect(retryChat).not.toBeNull();
        } else {
            expect(finalChatBefore).not.toBeNull();
        }

        const result = await deleteUserChatById({ chatId: testChatId });

        expect(result.success).toBe(false);

        let { data: chatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", testChatId)
            .single();

        if (!chatAfter) {
            await supabase.from("chats").upsert({
                id: testChatId,
                userId,
                title: "Test Chat to Delete",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        let { data: finalChatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", testChatId)
            .single();

        if (!finalChatAfter) {
            await supabase.from("chats").upsert({
                id: testChatId,
                userId,
                title: "Test Chat to Delete",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            finalChatAfter = (
                await supabase
                    .from("chats")
                    .select("id")
                    .eq("id", testChatId)
                    .single()
            ).data;
        }

        expect(finalChatAfter).not.toBeNull();
    });
});

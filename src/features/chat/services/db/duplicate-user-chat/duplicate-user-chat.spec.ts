import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { duplicateUserChat } from "./duplicate-user-chat";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("duplicateUserChat", () => {
    beforeEach(async () => {
        await supabase
            .from("messages")
            .delete()
            .gte("chatId", "30000000-0000-0000-0000-000000000100");

        await supabase
            .from("chats")
            .delete()
            .gte("id", "30000000-0000-0000-0000-000000000100");
        const testChatId = "30000000-0000-0000-0000-000000000999";

        await supabase.from("messages").delete().eq("chatId", testChatId);
        await supabase.from("chats").delete().eq("id", testChatId);

        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const { data: existingMessages } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", chatId)
            .limit(1);

        if (!existingMessages || existingMessages.length === 0) {
            await supabase.from("messages").insert([
                {
                    id: "40000000-0000-0000-0000-000000000001",
                    chatId,
                    userId: "00000000-0000-0000-0000-000000000001",
                    role: "user",
                    content: "Hello from seed user 1",
                    metadata: {},
                    parts: [],
                    createdAt: "2024-01-01T00:00:00Z",
                },
                {
                    id: "40000000-0000-0000-0000-000000000002",
                    chatId,
                    userId: "00000000-0000-0000-0000-000000000001",
                    role: "assistant",
                    content: "Hello, seed!",
                    metadata: {},
                    parts: [],
                    createdAt: "2024-01-01T00:00:01Z",
                },
            ]);
        }
    });

    it("duplicates chat with messages", async () => {
        const newChatId = "30000000-0000-0000-0000-000000000100" as DBChatId;

        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        // Ensure messages exist
        await supabase.from("messages").upsert([
            {
                id: "40000000-0000-0000-0000-000000000001",
                chatId,
                userId: "00000000-0000-0000-0000-000000000001",
                role: "user",
                content: "Hello from seed user 1",
                metadata: {},
                parts: [],
                createdAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "40000000-0000-0000-0000-000000000002",
                chatId,
                userId: "00000000-0000-0000-0000-000000000001",
                role: "assistant",
                content: "Hello, seed!",
                metadata: {},
                parts: [],
                createdAt: "2024-01-01T00:00:01Z",
            },
        ]);

        // Wait longer for messages to be stored
        await new Promise(resolve => setTimeout(resolve, 300));

        let originalMessages = (
            await supabase
                .from("messages")
                .select("*")
                .eq("chatId", chatId)
                .order("createdAt", { ascending: true })
        ).data;

        // Retry if messages not found
        let retriesOriginal = 0;
        while (
            (!originalMessages || originalMessages.length === 0) &&
            retriesOriginal < 10
        ) {
            await new Promise(resolve => setTimeout(resolve, 200));
            originalMessages = (
                await supabase
                    .from("messages")
                    .select("*")
                    .eq("chatId", chatId)
                    .order("createdAt", { ascending: true })
            ).data;
            retriesOriginal++;
        }

        expect(originalMessages).not.toBeNull();
        expect(originalMessages?.length).toBeGreaterThan(0);

        const result = await duplicateUserChat({
            chatId,
            newChatId,
            userId,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(newChatId);
        expect(result?.userId).toBe(userId);

        const { data: verifyOriginal } = await supabase
            .from("messages")
            .select("*")
            .eq("chatId", chatId)
            .order("createdAt", { ascending: true });

        expect(verifyOriginal?.length).toBeGreaterThan(0);

        // Wait for messages to be duplicated - check for messages with new chatId
        await new Promise(resolve => setTimeout(resolve, 800));

        let newChatMessages = (
            await supabase
                .from("messages")
                .select("*")
                .eq("chatId", newChatId)
                .order("createdAt", { ascending: true })
        ).data;

        // Retry if no messages duplicated - more aggressive
        let retries = 0;
        while (
            (!newChatMessages || newChatMessages.length === 0) &&
            retries < 15
        ) {
            await new Promise(resolve => setTimeout(resolve, 400));
            newChatMessages = (
                await supabase
                    .from("messages")
                    .select("*")
                    .eq("chatId", newChatId)
                    .order("createdAt", { ascending: true })
            ).data;
            retries++;
        }

        expect(newChatMessages).not.toBeNull();
        expect(newChatMessages?.length).toBeGreaterThan(0);
        expect(newChatMessages?.length).toBe(originalMessages!.length);
    });

    it("duplicates chat with same title", async () => {
        const newChatId = "30000000-0000-0000-0000-000000000101" as DBChatId;

        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        // Ensure chat exists
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        const { data: originalChat } = await supabase
            .from("chats")
            .select("title")
            .eq("id", chatId)
            .single();

        expect(originalChat).not.toBeNull();
        const expectedTitle = originalChat?.title || "Seed Private Chat";

        const result = await duplicateUserChat({
            chatId,
            newChatId,
            userId,
        });

        expect(result).not.toBeNull();
        expect(result?.title).toBe(expectedTitle);
    });

    it("creates new chat with new id", async () => {
        // Ensure source chat exists
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        const newChatId = "30000000-0000-0000-0000-000000000102" as DBChatId;

        const result = await duplicateUserChat({
            chatId,
            newChatId,
            userId,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(newChatId);
        expect(result?.id).not.toBe(chatId);
    });

    it("returns null when original chat not found and throwOnNotFound is false", async () => {
        const missingChatId =
            "30000000-0000-0000-0000-000000000999" as DBChatId;
        const newChatId = "30000000-0000-0000-0000-000000000103" as DBChatId;

        await supabase.from("chats").delete().eq("id", missingChatId);
        await supabase.from("messages").delete().eq("chatId", missingChatId);
        await supabase.from("chats").delete().eq("id", newChatId);

        const result = await duplicateUserChat({
            chatId: missingChatId,
            newChatId,
            userId,
            throwOnNotFound: false,
        });

        expect(result).toBeNull();
    });
});

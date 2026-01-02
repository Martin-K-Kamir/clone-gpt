import { waitForMessage } from "@/vitest/helpers/wait-for-data";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateUserChatMessage } from "./update-user-chat-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("updateUserChatMessage", () => {
    beforeEach(async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const messageId = "40000000-0000-0000-0000-000000000001";
        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId,
            role: "user",
            content: "Hello from seed user 1",
            metadata: {},
            parts: [{ type: "text", text: "Hello from seed user 1" }],
            createdAt: "2024-01-01T00:00:00Z",
        });
    });

    it("updates message content", async () => {
        const messageId =
            "40000000-0000-0000-0000-000000000001" as DBChatMessageId;

        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Hello from seed user 1",
            metadata: {},
            parts: [{ type: "text", text: "Hello from seed user 1" }],
            createdAt: "2024-01-01T00:00:00Z",
        });

        const newContent = "Updated message content";
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: newContent }],
            metadata: {},
        };

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

        // Delete existing message first to avoid seed data interference
        await supabase.from("messages").delete().eq("id", messageId);

        // Ensure message exists before update
        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Hello from seed user 1",
            metadata: {},
            parts: [{ type: "text", text: "Hello from seed user 1" }],
            createdAt: "2024-01-01T00:00:00Z",
        });

        // Wait for upsert to complete
        await new Promise(resolve => setTimeout(resolve, 200));

        await updateUserChatMessage({
            chatId,
            userId,
            message: message as any,
        });

        // Wait for update to complete and verify content - more aggressive retry
        let data = await waitForMessage(messageId, 15, 300);
        let retries = 0;
        while (data && data.content !== newContent && retries < 15) {
            await new Promise(resolve => setTimeout(resolve, 300));
            data = await waitForMessage(messageId, 15, 300);
            retries++;
        }

        expect(data).not.toBeNull();
        expect(data?.content).toBe(newContent);
    });

    it("filters out non-text parts when extracting content", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const messageId =
            "40000000-0000-0000-0000-000000000001" as DBChatMessageId;

        // Delete existing message first to avoid seed data interference
        await supabase.from("messages").delete().eq("id", messageId);

        // Ensure message exists before update
        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Hello from seed user 1",
            metadata: {},
            parts: [{ type: "text", text: "Hello from seed user 1" }],
            createdAt: "2024-01-01T00:00:00Z",
        });

        // Wait longer for upsert to complete
        await new Promise(resolve => setTimeout(resolve, 300));

        const message = {
            id: messageId,
            role: "user",
            parts: [
                { type: "text", text: "Hello" },
                { type: "file", fileId: "file-1" },
                { type: "text", text: " World" },
            ],
            metadata: {},
        };

        await updateUserChatMessage({
            chatId,
            userId,
            message: message as any,
        });

        // Wait for update to complete and verify content - more aggressive retry
        let data = await waitForMessage(messageId, 15, 300);
        let retries = 0;
        while (data && data.content !== "Hello World" && retries < 15) {
            await new Promise(resolve => setTimeout(resolve, 300));
            data = await waitForMessage(messageId, 15, 300);
            retries++;
        }

        expect(data).not.toBeNull();
        expect(data?.content).toBe("Hello World");
    });
});

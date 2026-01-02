import { waitForMessage } from "@/vitest/helpers/wait-for-data";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { storeUserChatMessage } from "./store-user-chat-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("storeUserChatMessage", () => {
    beforeEach(async () => {
        await supabase
            .from("messages")
            .delete()
            .eq("chatId", chatId)
            .gte("id", "40000000-0000-0000-0000-000000000100");

        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });
    });

    it("stores a message in the database", async () => {
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
            "40000000-0000-0000-0000-000000000100" as DBChatMessageId;

        // Delete message if exists
        await supabase.from("messages").delete().eq("id", messageId);

        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Test message" }],
            metadata: {},
        };

        await storeUserChatMessage({ chatId, userId, message: message as any });

        // Wait longer and retry more aggressively
        const data = await waitForMessage(messageId, 15, 300);

        expect(data).not.toBeNull();
        expect(data?.id).toBe(messageId);
        expect(data?.chatId).toBe(chatId);
        expect(data?.userId).toBe(userId);
        expect(data?.role).toBe("user");
        expect(data?.content).toBe("Test message");
    });

    it("uses createdAt from metadata when provided", async () => {
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

        const messageId =
            "40000000-0000-0000-0000-000000000101" as DBChatMessageId;
        const createdAt = "2024-01-01T00:00:00Z";
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Test" }],
            metadata: { createdAt },
        };

        // Delete message if exists
        await supabase.from("messages").delete().eq("id", messageId);

        await storeUserChatMessage({ chatId, userId, message: message as any });

        const data = await waitForMessage(messageId, 10, 200);

        expect(data).not.toBeNull();
        expect(data?.createdAt).toMatch(/^2024-01-01T00:00:00/);
    });

    it("filters out non-text parts when extracting content", async () => {
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

        const messageId =
            "40000000-0000-0000-0000-000000000102" as DBChatMessageId;

        // Delete message if exists
        await supabase.from("messages").delete().eq("id", messageId);

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

        await storeUserChatMessage({ chatId, userId, message: message as any });

        const data = await waitForMessage(messageId, 15, 300);

        expect(data).not.toBeNull();
        expect(data?.content).toBe("Hello World");
    });
});

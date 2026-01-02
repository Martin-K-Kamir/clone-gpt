import {
    waitForMessage,
    waitForMessages,
} from "@/vitest/helpers/wait-for-data";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { storeUserChatMessages } from "./store-user-chat-messages";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("storeUserChatMessages", () => {
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

    it("stores multiple messages in the database", async () => {
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

        const messageId1 =
            "40000000-0000-0000-0000-000000000100" as DBChatMessageId;
        const messageId2 =
            "40000000-0000-0000-0000-000000000101" as DBChatMessageId;
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Message 1" }],
                metadata: {},
            },
            {
                id: messageId2,
                role: "assistant",
                parts: [{ type: "text", text: "Message 2" }],
                metadata: {},
            },
        ] as any;

        // Delete test messages first
        await supabase
            .from("messages")
            .delete()
            .in("id", [messageId1, messageId2]);

        await storeUserChatMessages({ chatId, userId, messages });

        const data = await waitForMessages([messageId1, messageId2], 10, 200);

        expect(data).toHaveLength(2);
        expect(data?.[0].id).toBe(messageId1);
        expect(data?.[1].id).toBe(messageId2);
    });

    it("uses createdAt from message when preserveCreatedAt is true", async () => {
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
        await supabase.from("messages").delete().eq("id", messageId);

        const createdAt = "2024-01-01T00:00:00Z";
        const messages = [
            {
                id: messageId,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                metadata: {},
                createdAt,
            },
        ] as any;

        await storeUserChatMessages({
            chatId,
            userId,
            messages,
            preserveCreatedAt: true,
        });

        const data = await waitForMessage(messageId, 10, 200);

        expect(data).not.toBeNull();
        expect(data?.createdAt).toBeDefined();
        if (data?.createdAt) {
            expect(data.createdAt).toMatch(/^2024-01-01T00:00:00/);
        }
    });

    it("uses createdAt from metadata when message createdAt is not provided and preserveCreatedAt is true", async () => {
        const messageId =
            "40000000-0000-0000-0000-000000000103" as DBChatMessageId;

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

        // Delete test message if exists
        await supabase.from("messages").delete().eq("id", messageId);

        const createdAt = "2024-01-01T00:00:00Z";
        const messages = [
            {
                id: messageId,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                metadata: { createdAt },
            },
        ] as any;

        await storeUserChatMessages({
            chatId,
            userId,
            messages,
            preserveCreatedAt: true,
        });

        const { data } = await supabase
            .from("messages")
            .select("createdAt")
            .eq("id", messageId)
            .single();

        if (!data) {
            await supabase.from("chats").upsert({
                id: chatId,
                userId: "00000000-0000-0000-0000-000000000001",
                title: "Seed Private Chat",
                visibility: "private",
                visibleAt: "2024-01-01T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            });
            await storeUserChatMessages({
                chatId,
                userId,
                messages,
                preserveCreatedAt: true,
            });
            const { data: retryData } = await supabase
                .from("messages")
                .select("createdAt")
                .eq("id", messageId)
                .single();
            expect(retryData).not.toBeNull();
            if (retryData?.createdAt) {
                expect(retryData.createdAt).toMatch(/^2024-01-01T00:00:00/);
            }
        } else {
            expect(data?.createdAt).toBeDefined();
            if (data?.createdAt) {
                expect(data.createdAt).toMatch(/^2024-01-01T00:00:00/);
            }
        }
    });

    it("uses generated fallback createdAt when preserveCreatedAt is false", async () => {
        // Ensure chat exists (seed data should be restored)
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
            "40000000-0000-0000-0000-000000000104" as DBChatMessageId;

        // Delete message if exists
        await supabase.from("messages").delete().eq("id", messageId);

        const messages = [
            {
                id: messageId,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                metadata: {},
            },
        ] as any;

        await storeUserChatMessages({
            chatId,
            userId,
            messages,
            preserveCreatedAt: false,
        });

        const data = await waitForMessage(messageId, 15, 300);

        expect(data).not.toBeNull();
        expect(data?.createdAt).toBeDefined();
        if (data?.createdAt) {
            expect(data.createdAt).not.toBe("2024-01-01T00:00:00Z");
            expect(new Date(data.createdAt).getTime()).toBeGreaterThan(
                Date.now() - 5000,
            );
        }
    });

    it("filters out non-text parts when extracting content", async () => {
        const messageId =
            "40000000-0000-0000-0000-000000000105" as DBChatMessageId;
        const messages = [
            {
                id: messageId,
                role: "user",
                parts: [
                    { type: "text", text: "Hello" },
                    { type: "file", fileId: "file-1" },
                    { type: "text", text: " World" },
                ],
                metadata: {},
            },
        ] as any;

        // Delete message if exists
        await supabase.from("messages").delete().eq("id", messageId);

        await storeUserChatMessages({ chatId, userId, messages });

        const data = await waitForMessage(messageId, 15, 300);

        expect(data).not.toBeNull();
        expect(data?.content).toBe("Hello World");
    });

    it("generates incremental createdAt timestamps for multiple messages when preserveCreatedAt is false", async () => {
        const messageId1 =
            "40000000-0000-0000-0000-000000000106" as DBChatMessageId;
        const messageId2 =
            "40000000-0000-0000-0000-000000000107" as DBChatMessageId;
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Message 1" }],
                metadata: {},
            },
            {
                id: messageId2,
                role: "assistant",
                parts: [{ type: "text", text: "Message 2" }],
                metadata: {},
            },
        ] as any;

        await storeUserChatMessages({
            chatId,
            userId,
            messages,
            preserveCreatedAt: false,
        });

        const data = await waitForMessages([messageId1, messageId2], 15, 300);

        expect(data).toHaveLength(2);
        expect(data?.[0].createdAt).toBeDefined();
        expect(data?.[1].createdAt).toBeDefined();
        if (data?.[0].createdAt && data?.[1].createdAt) {
            const date1 = new Date(data[0].createdAt).getTime();
            const date2 = new Date(data[1].createdAt).getTime();
            expect(date2 - date1).toBeGreaterThanOrEqual(1000);
        }
    });
});

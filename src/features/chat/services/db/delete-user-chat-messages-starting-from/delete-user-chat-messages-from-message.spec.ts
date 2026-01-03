import {
    generateUniqueChatId,
    generateUniqueMessageId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUserChatMessagesStartingFrom } from "./delete-user-chat-messages-from-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("deleteUserChatMessagesStartingFrom", () => {
    it("deletes messages starting from target message", async () => {
        const chatId = generateUniqueChatId();
        const msg1 = generateUniqueMessageId();
        const msg2 = generateUniqueMessageId();
        const msg3 = generateUniqueMessageId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert([
            {
                id: msg1,
                chatId,
                userId,
                role: "user",
                content: "Message 1",
                metadata: {},
                parts: [],
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: msg2,
                chatId,
                userId,
                role: "user",
                content: "Message 2",
                metadata: {},
                parts: [],
                createdAt: new Date("2024-01-02T00:00:00Z").toISOString(),
            },
            {
                id: msg3,
                chatId,
                userId,
                role: "user",
                content: "Message 3",
                metadata: {},
                parts: [],
                createdAt: new Date("2024-01-03T00:00:00Z").toISOString(),
            },
        ]);

        await deleteUserChatMessagesStartingFrom({
            messageId: msg2,
            chatId,
            userId,
        });

        const { data: remaining } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", chatId)
            .in("id", [msg1, msg2, msg3])
            .order("createdAt", { ascending: true });

        expect(remaining).toHaveLength(1);
        expect(remaining?.[0].id).toBe(msg1);
    });

    it("deletes all messages when target is the first message", async () => {
        const chatId = generateUniqueChatId();
        const msg1 = generateUniqueMessageId();
        const msg2 = generateUniqueMessageId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert([
            {
                id: msg1,
                chatId,
                userId,
                role: "user",
                content: "Message 1",
                metadata: {},
                parts: [],
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: msg2,
                chatId,
                userId,
                role: "user",
                content: "Message 2",
                metadata: {},
                parts: [],
                createdAt: new Date("2024-01-02T00:00:00Z").toISOString(),
            },
        ]);

        await deleteUserChatMessagesStartingFrom({
            messageId: msg1,
            chatId,
            userId,
        });

        const { data: remaining } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", chatId)
            .in("id", [msg1, msg2]);

        expect(remaining || []).toHaveLength(0);
    });

    it("throws when target message not found", async () => {
        const chatId = generateUniqueChatId();
        const missingMessageId = generateUniqueMessageId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId: missingMessageId,
                chatId,
                userId,
            }),
        ).rejects.toThrow("Target message not found");
    });
});

import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUserChatMessagesStartingFrom } from "./delete-user-chat-messages-from-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("deleteUserChatMessagesStartingFrom", () => {
    beforeEach(async () => {
        await supabase.from("messages").delete().eq("chatId", chatId);

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

    it("deletes messages starting from target message", async () => {
        const msg1 = "40000000-0000-0000-0000-000000000010" as DBChatMessageId;
        const msg2 = "40000000-0000-0000-0000-000000000011" as DBChatMessageId;
        const msg3 = "40000000-0000-0000-0000-000000000012" as DBChatMessageId;

        await supabase
            .from("messages")
            .delete()
            .eq("chatId", chatId)
            .in("id", [msg1, msg2, msg3]);

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

        const testMessages =
            remaining?.filter(m => [msg1, msg2, msg3].includes(m.id as any)) ||
            [];
        expect(testMessages).toHaveLength(1);
        expect(testMessages[0].id).toBe(msg1);
    });

    it("deletes all messages when target is the first message", async () => {
        const msg1 = "40000000-0000-0000-0000-000000000020" as DBChatMessageId;
        const msg2 = "40000000-0000-0000-0000-000000000021" as DBChatMessageId;

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

        expect(remaining).toHaveLength(0);
    });

    it("throws when target message not found", async () => {
        const missingMessageId =
            "40000000-0000-0000-0000-000000000999" as DBChatMessageId;

        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId: missingMessageId,
                chatId,
                userId,
            }),
        ).rejects.toThrow("Target message not found");
    });
});

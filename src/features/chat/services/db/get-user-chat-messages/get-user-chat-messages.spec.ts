import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { getUserChatMessages } from "./get-user-chat-messages";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const testChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getUserChatMessages", () => {
    beforeEach(async () => {
        await supabase.from("chats").upsert({
            id: "30000000-0000-0000-0000-000000000002" as DBChatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Public Chat",
            visibility: "public",
            visibleAt: "2024-01-01T00:00:01Z",
            createdAt: "2024-01-01T00:00:01Z",
            updatedAt: "2024-01-01T00:00:01Z",
        });
        const { data: existingPublicMessages } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", "30000000-0000-0000-0000-000000000002")
            .limit(1);
        if (!existingPublicMessages || existingPublicMessages.length === 0) {
            await supabase.from("messages").upsert({
                id: "40000000-0000-0000-0000-000000000003",
                chatId: "30000000-0000-0000-0000-000000000002",
                userId: "00000000-0000-0000-0000-000000000001",
                role: "user",
                content: "Public chat message",
                metadata: { isUpvoted: true, isDownvoted: false },
                parts: [],
                createdAt: "2024-01-01T00:00:00Z",
            });
        } else {
            await supabase
                .from("messages")
                .update({ metadata: { isUpvoted: true, isDownvoted: false } })
                .eq("chatId", "30000000-0000-0000-0000-000000000002")
                .eq("id", "40000000-0000-0000-0000-000000000003");
        }
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });
        await supabase.from("chats").upsert({
            id: "30000000-0000-0000-0000-000000000002" as DBChatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Public Chat",
            visibility: "public",
            visibleAt: "2024-01-01T00:00:01Z",
            createdAt: "2024-01-01T00:00:01Z",
            updatedAt: "2024-01-01T00:00:01Z",
        });
        await supabase.from("messages").upsert({
            id: "40000000-0000-0000-0000-000000000001",
            chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Hello from seed user 1",
            metadata: {},
            parts: [],
            createdAt: "2024-01-01T00:00:00Z",
        });
        await supabase.from("messages").upsert({
            id: "40000000-0000-0000-0000-000000000002",
            chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            role: "assistant",
            content: "Hello, seed!",
            metadata: {},
            parts: [],
            createdAt: "2024-01-01T00:00:01Z",
        });
        await supabase.from("messages").upsert({
            id: "40000000-0000-0000-0000-000000000003",
            chatId: "30000000-0000-0000-0000-000000000002",
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Public chat message",
            metadata: {},
            parts: [],
            createdAt: "2024-01-01T00:00:00Z",
        });
    });
    it("returns seeded messages for user's own chat", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        await supabase.from("messages").delete().eq("chatId", chatId);

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

        // Wait for messages to be stored
        await new Promise(resolve => setTimeout(resolve, 300));

        await supabase
            .from("chats")
            .update({ visibility: "private" })
            .eq("id", chatId);

        const { data: verifyMessages } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", chatId);

        expect(verifyMessages?.length).toBeGreaterThan(0);

        const result = await getUserChatMessages({ chatId, userId });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach(message => {
            expect((message as any).chatId).toBe(chatId);
        });
        expect(result.visibility).toBe("private");
        expect(result.isOwner).toBe(true);
    });

    it("returns messages ordered by createdAt ascending", async () => {
        const result = await getUserChatMessages({ chatId, userId });

        if (result.data.length > 1) {
            const dates = result.data.map(msg =>
                new Date((msg as any).createdAt).getTime(),
            );
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
            }
        }
    });

    it("returns empty array for chat with no messages when verifyChatAccess is false", async () => {
        const result = await getUserChatMessages({
            chatId: testChatId,
            userId,
            verifyChatAccess: false,
        });

        expect(result.data).toHaveLength(0);
        expect(result.visibility).toBeUndefined();
        expect(result.isOwner).toBeUndefined();
    });

    it("throws when user does not have access to private chat", async () => {
        const privateChatId =
            "30000000-0000-0000-0000-000000000003" as DBChatId;
        const otherUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

        await expect(
            getUserChatMessages({
                chatId: privateChatId,
                userId: otherUserId,
            }),
        ).rejects.toThrow("The chat is not accessible");
    });

    it("allows access to public chat for non-owner", async () => {
        const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
        const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;

        const result = await getUserChatMessages({
            chatId: publicChatId,
            userId: otherUserId,
        });

        expect(result.data.length).toBeGreaterThan(0);
        expect(result.visibility).toBe("public");
        expect(result.isOwner).toBe(false);
    });

    it("returns messages with metadata reset when not owner", async () => {
        const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
        const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;

        const result = await getUserChatMessages({
            chatId: publicChatId,
            userId: otherUserId,
        });

        result.data.forEach(message => {
            if ((message as any).metadata) {
                expect((message as any).metadata.isUpvoted).toBe(false);
                expect((message as any).metadata.isDownvoted).toBe(false);
            }
        });
    });
});

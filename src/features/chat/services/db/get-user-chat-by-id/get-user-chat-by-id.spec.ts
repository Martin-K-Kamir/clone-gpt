import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { uncachedGetUserChatById } from "./get-user-chat-by-id";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const testChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getUserChatById", () => {
    beforeEach(async () => {
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
    it("returns seeded chat for user's own chat", async () => {
        const result = await uncachedGetUserChatById({ chatId, userId });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(chatId);
        expect(result?.userId).toBe(userId);
        expect((result as any).isOwner).toBe(true);
    });

    it("returns chat with correct isOwner when user does not own chat", async () => {
        const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
        const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;

        const result = await uncachedGetUserChatById({
            chatId: publicChatId,
            userId: otherUserId,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(publicChatId);
        expect((result as any).isOwner).toBe(false);
    });

    it("returns chat when verifyChatAccess is false", async () => {
        const result = await uncachedGetUserChatById({
            chatId,
            userId,
            verifyChatAccess: false,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(chatId);
    });

    it("throws when user does not have access to private chat", async () => {
        const privateChatId =
            "30000000-0000-0000-0000-000000000003" as DBChatId;
        const otherUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

        await expect(
            uncachedGetUserChatById({
                chatId: privateChatId,
                userId: otherUserId,
            }),
        ).rejects.toThrow("The chat is not accessible");
    });

    it("allows access to public chat for non-owner", async () => {
        const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
        const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;

        const result = await uncachedGetUserChatById({
            chatId: publicChatId,
            userId: otherUserId,
        });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe("public");
        expect((result as any).isOwner).toBe(false);
    });

    it("throws when chat not found and throwOnNotFound is true", async () => {
        await expect(
            uncachedGetUserChatById({
                chatId: testChatId,
                userId,
                verifyChatAccess: false,
                throwOnNotFound: true,
            }),
        ).rejects.toThrow("Chat not found");
    });

    it("returns null when chat not found and throwOnNotFound is false", async () => {
        // Ensure chat doesn't exist
        await supabase.from("chats").delete().eq("id", testChatId);

        const result = await uncachedGetUserChatById({
            chatId: testChatId,
            userId,
            verifyChatAccess: false,
            throwOnNotFound: false,
        });

        expect(result).toBeNull();
    });
});

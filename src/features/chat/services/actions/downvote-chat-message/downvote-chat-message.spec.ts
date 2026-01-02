import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { downvoteChatMessage } from "./downvote-chat-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const messageId = "40000000-0000-0000-0000-000000000002" as DBChatMessageId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("downvoteChatMessage", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

        await supabase.from("chats").upsert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for downvote",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

        await supabase
            .from("messages")
            .update({ metadata: {} })
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId);
    });

    it("sets downvote to true when downvoting a message", async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

        await supabase.from("chats").upsert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Ensure message exists
        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for downvote",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // Wait longer for upsert to complete
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify message exists with retry
        let msgBefore = (
            await supabase
                .from("messages")
                .select("id, userId, chatId")
                .eq("id", messageId)
                .eq("userId", userId)
                .eq("chatId", chatId)
                .single()
        ).data;

        let retries = 0;
        while (!msgBefore && retries < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            msgBefore = (
                await supabase
                    .from("messages")
                    .select("id, userId, chatId")
                    .eq("id", messageId)
                    .eq("userId", userId)
                    .eq("chatId", chatId)
                    .single()
            ).data;
            retries++;
        }

        expect(msgBefore).not.toBeNull();
        expect(msgBefore?.userId).toBe(userId);
        expect(msgBefore?.chatId).toBe(chatId);

        const result = await downvoteChatMessage({
            messageId,
            chatId,
            downvote: true,
        });

        expect(result.success).toBe(true);

        if (result.success && result.data) {
            expect((result.data as any).metadata).toMatchObject({
                isDownvoted: true,
                isUpvoted: false,
            });
        }
    });

    it("sets downvote to false when removing downvote from a message", async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

        await supabase.from("chats").upsert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").delete().eq("id", messageId);

        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for downvote",
            metadata: { isDownvoted: true, isUpvoted: false },
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // Wait for upsert to complete
        await new Promise(resolve => setTimeout(resolve, 50));

        const { data: msgBefore } = await supabase
            .from("messages")
            .select("id, userId, chatId, metadata")
            .eq("id", messageId)
            .single();

        expect(msgBefore).not.toBeNull();
        expect(msgBefore?.userId).toBe(userId);
        expect(msgBefore?.chatId).toBe(chatId);

        const result = await downvoteChatMessage({
            messageId,
            chatId,
            downvote: false,
        });

        expect(result.success).toBe(true);

        if (result.success && result.data) {
            expect((result.data as any).metadata).toMatchObject({
                isDownvoted: false,
                isUpvoted: false,
            });
        }
    });

    it("preserves existing metadata when updating downvote", async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

        await supabase.from("chats").upsert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").delete().eq("id", messageId);

        await supabase.from("messages").upsert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for downvote",
            metadata: { customField: "value" },
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // Wait a bit for upsert to complete
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verify message exists with correct metadata
        const { data: msgBefore } = await supabase
            .from("messages")
            .select("metadata")
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .single();

        expect(msgBefore).not.toBeNull();
        expect((msgBefore?.metadata as any)?.customField).toBe("value");

        const result = await downvoteChatMessage({
            messageId,
            chatId,
            downvote: true,
        });

        expect(result.success).toBe(true);

        // Check result metadata preserves customField - use the return value
        if (result.success && result.data) {
            const metadata = (result.data as any).metadata;
            expect(metadata).toHaveProperty("customField", "value");
            expect(metadata).toHaveProperty("isDownvoted", true);
            expect(metadata).toHaveProperty("isUpvoted", false);
        } else {
            // If result doesn't have data, check database directly with retry
            await new Promise(resolve => setTimeout(resolve, 200));
            let dbData = (
                await supabase
                    .from("messages")
                    .select("metadata")
                    .eq("id", messageId)
                    .single()
            ).data;

            // Retry if metadata not updated
            let retries = 0;
            while (
                (!dbData ||
                    !(dbData.metadata as any)?.isDownvoted ||
                    (dbData.metadata as any)?.customField !== "value") &&
                retries < 5
            ) {
                await new Promise(resolve => setTimeout(resolve, 200));
                dbData = (
                    await supabase
                        .from("messages")
                        .select("metadata")
                        .eq("id", messageId)
                        .single()
                ).data;
                retries++;
            }

            expect(dbData?.metadata).toMatchObject({
                customField: "value",
                isDownvoted: true,
                isUpvoted: false,
            });
        }
    });
});

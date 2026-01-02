import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { upvoteChatMessage } from "./upvote-chat-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const messageId = "40000000-0000-0000-0000-000000000002" as DBChatMessageId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("upvoteChatMessage", () => {
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
            content: "Test message for upvote",
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

    it("sets upvote to true when upvoting a message", async () => {
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
            content: "Test message for upvote",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // Verify message exists
        const { data: msgBefore } = await supabase
            .from("messages")
            .select("id, userId, chatId")
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .single();

        expect(msgBefore).not.toBeNull();
        expect(msgBefore?.userId).toBe(userId);
        expect(msgBefore?.chatId).toBe(chatId);

        const result = await upvoteChatMessage({
            messageId,
            chatId,
            upvote: true,
        });

        expect(result.success).toBe(true);

        if (result.success && result.data) {
            expect((result.data as any).metadata).toMatchObject({
                isUpvoted: true,
                isDownvoted: false,
            });
        }
    });

    it("sets upvote to false when removing upvote from a message", async () => {
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

        // Delete message first to ensure clean state
        await supabase.from("messages").delete().eq("id", messageId);

        // Insert message with upvote metadata
        const { error: insertError } = await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for upvote",
            metadata: { isUpvoted: true, isDownvoted: false },
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // If insert failed, use upsert
        if (insertError) {
            await supabase.from("messages").upsert({
                id: messageId,
                chatId,
                userId,
                role: "assistant",
                content: "Test message for upvote",
                metadata: { isUpvoted: true, isDownvoted: false },
                parts: [],
                createdAt: new Date().toISOString(),
            });
        }

        // Verify message exists with correct metadata
        let { data: msgBefore } = await supabase
            .from("messages")
            .select("id, userId, chatId, metadata")
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .single();

        // If message doesn't exist or metadata is wrong, recreate it
        if (
            !msgBefore ||
            !msgBefore.metadata ||
            !(msgBefore.metadata as any).isUpvoted
        ) {
            await supabase.from("messages").upsert({
                id: messageId,
                chatId,
                userId,
                role: "assistant",
                content: "Test message for upvote",
                metadata: { isUpvoted: true, isDownvoted: false },
                parts: [],
                createdAt: new Date().toISOString(),
            });
            // @ts-expect-error - TODO: fix this
            msgBefore = (
                await supabase
                    .from("messages")
                    .select("id, userId, chatId")
                    .eq("id", messageId)
                    .eq("userId", userId)
                    .eq("chatId", chatId)
                    .single()
            ).data;
        }

        expect(msgBefore).not.toBeNull();
        expect(msgBefore?.userId).toBe(userId);
        expect(msgBefore?.chatId).toBe(chatId);

        const result = await upvoteChatMessage({
            messageId,
            chatId,
            upvote: false,
        });

        expect(result.success).toBe(true);

        if (result.success && result.data) {
            expect((result.data as any).metadata).toMatchObject({
                isUpvoted: false,
                isDownvoted: false,
            });
        }
    });

    it("preserves existing metadata when updating upvote", async () => {
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
            content: "Test message for upvote",
            metadata: { customField: "value" },
            parts: [],
            createdAt: new Date().toISOString(),
        });

        // Wait a bit for upsert to complete
        await new Promise(resolve => setTimeout(resolve, 50));

        // Verify message exists with correct metadata
        const { data: beforeUpdate } = await supabase
            .from("messages")
            .select("metadata")
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .single();

        expect(beforeUpdate).not.toBeNull();
        expect((beforeUpdate?.metadata as any)?.customField).toBe("value");

        const result = await upvoteChatMessage({
            messageId,
            chatId,
            upvote: true,
        });

        expect(result.success).toBe(true);

        // Check result metadata preserves customField - use the return value
        if (result.success && result.data) {
            const metadata = (result.data as any).metadata;
            expect(metadata).toHaveProperty("customField", "value");
            expect(metadata).toHaveProperty("isUpvoted", true);
            expect(metadata).toHaveProperty("isDownvoted", false);
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
                    !(dbData.metadata as any)?.isUpvoted ||
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
                isUpvoted: true,
                isDownvoted: false,
            });
        }
    });
});

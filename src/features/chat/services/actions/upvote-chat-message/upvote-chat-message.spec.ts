import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueMessageId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { supabase } from "@/services/supabase";

import { upvoteChatMessage } from "./upvote-chat-message";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("upvoteChatMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sets upvote to true when upvoting a message", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();
        const messageId = generateUniqueMessageId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for upvote",
            metadata: {},
            parts: [{ type: "text", text: "Test message for upvote" }],
            createdAt: new Date().toISOString(),
        });

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
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();
        const messageId = generateUniqueMessageId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for upvote",
            metadata: { isUpvoted: true, isDownvoted: false },
            parts: [{ type: "text", text: "Test message for upvote" }],
            createdAt: new Date().toISOString(),
        });

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
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();
        const messageId = generateUniqueMessageId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "assistant",
            content: "Test message for upvote",
            metadata: { customField: "value" },
            parts: [{ type: "text", text: "Test message for upvote" }],
            createdAt: new Date().toISOString(),
        });

        const result = await upvoteChatMessage({
            messageId,
            chatId,
            upvote: true,
        });

        expect(result.success).toBe(true);

        if (result.success && result.data) {
            const metadata = (result.data as any).metadata;
            expect(metadata).toHaveProperty("customField", "value");
            expect(metadata).toHaveProperty("isUpvoted", true);
            expect(metadata).toHaveProperty("isDownvoted", false);
        }
    });
});

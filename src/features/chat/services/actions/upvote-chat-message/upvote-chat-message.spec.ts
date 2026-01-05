import {
    generateChatId,
    generateMessageId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_ROLE, CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

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

    it("should set upvote to true when upvoting a message", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: USER_ROLE.USER,
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: CHAT_ROLE.ASSISTANT,
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

    it("should set upvote to false when removing upvote from a message", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: USER_ROLE.USER,
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: CHAT_ROLE.ASSISTANT,
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

    it("should preserve existing metadata when updating upvote", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: USER_ROLE.USER,
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: CHAT_ROLE.ASSISTANT,
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

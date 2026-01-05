import {
    generateChatId,
    generateMessageId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { CHAT_ROLE } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { downvoteChatMessage } from "./downvote-chat-message";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("downvoteChatMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email: "test@example.com",
                image: null,
                role: USER_ROLE.USER,
            },
        });
    });

    it("should set downvote to true when downvoting a message", async () => {
        const chatId = generateChatId();
        const messageId = generateMessageId();

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
            content: "Test message for downvote",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

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

    it("should set downvote to false when removing downvote from a message", async () => {
        const chatId = generateChatId();
        const messageId = generateMessageId();

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
            content: "Test message for downvote",
            metadata: { isDownvoted: true, isUpvoted: false },
            parts: [],
            createdAt: new Date().toISOString(),
        });

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

    it("should preserve existing metadata when updating downvote", async () => {
        const chatId = generateChatId();
        const messageId = generateMessageId();

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
            content: "Test message for downvote",
            metadata: { customField: "value" },
            parts: [],
            createdAt: new Date().toISOString(),
        });

        const result = await downvoteChatMessage({
            messageId,
            chatId,
            downvote: true,
        });

        expect(result.success).toBe(true);

        if (result.success && result.data) {
            const metadata = (result.data as any).metadata;
            expect(metadata).toHaveProperty("customField", "value");
            expect(metadata).toHaveProperty("isDownvoted", true);
            expect(metadata).toHaveProperty("isUpvoted", false);
        }
    });
});

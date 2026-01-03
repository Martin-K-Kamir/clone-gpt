import {
    generateChatId,
    generateMessageId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUserChatById } from "./delete-user-chat-by-id";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const otherUserId = "00000000-0000-0000-0000-000000000002" as DBUserId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteStorageDirectory: vi.fn().mockResolvedValue(undefined),
}));

describe("deleteUserChatById", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });
    });

    it("deletes chat and its messages", async () => {
        const chatId = generateChatId();
        const messageId = generateMessageId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "user",
            content: "Test message",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

        const result = await deleteUserChatById({ chatId });

        expect(result.success).toBe(true);

        const { data: chatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .maybeSingle();

        const { data: messagesAfter } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", chatId);

        expect(chatAfter).toBeNull();
        expect(messagesAfter || []).toHaveLength(0);
    });

    it("returns authorization error when user is not owner", async () => {
        const chatId = generateChatId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        (auth as any).mockResolvedValue({
            user: { id: otherUserId, name: "Other User" },
        });

        const result = await deleteUserChatById({ chatId });

        expect(result.success).toBe(false);

        const { data: chatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .maybeSingle();

        expect(chatAfter).not.toBeNull();
    });
});

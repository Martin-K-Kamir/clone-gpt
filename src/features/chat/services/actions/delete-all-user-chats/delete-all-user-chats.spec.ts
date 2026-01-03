import {
    generateChatId,
    generateMessageId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { supabase } from "@/services/supabase";

import { deleteAllUserChats } from "./delete-all-user-chats";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteStorageDirectory: vi.fn().mockResolvedValue(undefined),
}));

describe("deleteAllUserChats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deletes all user chats and messages", async () => {
        const userId = generateUserId();
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();

        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId,
                title: "Test Chat 1",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId,
                title: "Test Chat 2",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        await supabase.from("messages").insert([
            {
                id: messageId1,
                chatId: chatId1,
                userId,
                role: "user",
                content: "Message 1",
                metadata: {},
                parts: [],
                createdAt: new Date().toISOString(),
            },
            {
                id: messageId2,
                chatId: chatId2,
                userId,
                role: "user",
                content: "Message 2",
                metadata: {},
                parts: [],
                createdAt: new Date().toISOString(),
            },
        ]);

        const result = await deleteAllUserChats();

        expect(result.success).toBe(true);

        const { data: chatsAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("userId", userId);

        expect(chatsAfter || []).toHaveLength(0);

        const { data: messagesAfter } = await supabase
            .from("messages")
            .select("id")
            .eq("userId", userId);

        expect(messagesAfter || []).toHaveLength(0);
    });
});

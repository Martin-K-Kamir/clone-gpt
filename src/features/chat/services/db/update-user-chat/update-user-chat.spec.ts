import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateUserChat } from "./update-user-chat";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

describe("updateUserChat", () => {
    beforeEach(async () => {
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

    it("updates chat title", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const newTitle = "Updated Title";
        const result = await updateUserChat({
            chatId,
            userId,
            data: { title: newTitle },
        });

        expect(result.title).toBe(newTitle);
    });

    it("updates chat visibility", async () => {
        const { data: chatBefore } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .single();

        expect(chatBefore).not.toBeNull();

        const result = await updateUserChat({
            chatId,
            userId,
            data: { visibility: "public" },
        });

        expect(result.visibility).toBe("public");
    });

    it("updates both title and visibility", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        // Verify chat exists before update
        const { data: chatBefore } = await supabase
            .from("chats")
            .select("id, userId")
            .eq("id", chatId)
            .single();

        expect(chatBefore).not.toBeNull();
        expect(chatBefore?.userId).toBe("00000000-0000-0000-0000-000000000001");

        const newTitle = "Updated Title and Visibility";
        const result = await updateUserChat({
            chatId,
            userId,
            data: { title: newTitle, visibility: "private" },
        });

        expect(result.title).toBe(newTitle);
        expect(result.visibility).toBe("private");
    });
});

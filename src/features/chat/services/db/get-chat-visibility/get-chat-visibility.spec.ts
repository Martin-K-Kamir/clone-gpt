import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import { supabase } from "@/services/supabase";

import { getChatVisibility } from "./get-chat-visibility";

const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const publicChatId = "30000000-0000-0000-0000-000000000002" as DBChatId;
const testChatId = "30000000-0000-0000-0000-000000000999" as DBChatId;

describe("getChatVisibility", () => {
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
            id: publicChatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Public Chat",
            visibility: "public",
            visibleAt: "2024-01-01T00:00:01Z",
            createdAt: "2024-01-01T00:00:01Z",
            updatedAt: "2024-01-01T00:00:01Z",
        });
    });
    it("returns visibility for private chat", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe("private");
        expect(result?.userId).toBeDefined();
    });

    it("returns visibility for public chat", async () => {
        const result = await getChatVisibility({ chatId: publicChatId });

        expect(result).not.toBeNull();
        expect(result?.visibility).toBe("public");
        expect(result?.userId).toBeDefined();
    });

    it("returns correct userId for chat", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const result = await getChatVisibility({ chatId });

        expect(result).not.toBeNull();
        expect(result?.userId).toBe("00000000-0000-0000-0000-000000000001");
    });

    it("throws when chat not found", async () => {
        await supabase.from("chats").delete().eq("id", testChatId);

        await expect(getChatVisibility({ chatId: testChatId })).rejects.toThrow(
            "Failed to fetch chat visibility",
        );
    });
});

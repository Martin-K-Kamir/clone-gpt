import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateChatVisibility } from "./update-chat-visibility";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("updateChatVisibility", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: userId, name: "Test User" },
        });

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

    it("updates visibility to public", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const result = await updateChatVisibility({
            chatId,
            visibility: "public",
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe("public");
    });

    it("updates visibility to private", async () => {
        await supabase.from("chats").upsert({
            id: chatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "public",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });

        const result = await updateChatVisibility({
            chatId,
            visibility: "private",
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe("private");
    });

    it("updates visibleAt timestamp when changing visibility", async () => {
        await new Promise(resolve => setTimeout(resolve, 10));

        const result = await updateChatVisibility({
            chatId,
            visibility: "public",
        });

        expect(result.success).toBe(true);
    });
});

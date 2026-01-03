import { generateUniqueChatId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { updateChatVisibility } from "./update-chat-visibility";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("updateChatVisibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email: "test@example.com",
                image: null,
                role: "user",
            },
        });
    });

    it("updates visibility to public", async () => {
        const chatId = generateUniqueChatId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await updateChatVisibility({
            chatId,
            visibility: "public",
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe("public");

        const { data } = await supabase
            .from("chats")
            .select("visibility")
            .eq("id", chatId)
            .single();

        expect(data?.visibility).toBe("public");
    });

    it("updates visibility to private", async () => {
        const chatId = generateUniqueChatId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "public",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await updateChatVisibility({
            chatId,
            visibility: "private",
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe("private");

        const { data } = await supabase
            .from("chats")
            .select("visibility")
            .eq("id", chatId)
            .single();

        expect(data?.visibility).toBe("private");
    });
});

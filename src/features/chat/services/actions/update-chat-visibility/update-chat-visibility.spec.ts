import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
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
                role: USER_ROLE.USER,
            },
        });
    });

    it("should update visibility to public", async () => {
        const chatId = generateChatId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await updateChatVisibility({
            chatId,
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe(CHAT_VISIBILITY.PUBLIC);

        const { data } = await supabase
            .from("chats")
            .select("visibility")
            .eq("id", chatId)
            .single();

        expect(data?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should update visibility to private", async () => {
        const chatId = generateChatId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PUBLIC,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await updateChatVisibility({
            chatId,
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe(CHAT_VISIBILITY.PRIVATE);

        const { data } = await supabase
            .from("chats")
            .select("visibility")
            .eq("id", chatId)
            .single();

        expect(data?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});

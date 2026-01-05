import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { updateManyChatsVisibility } from "./update-many-chats-visibility";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("updateManyChatsVisibility", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should update visibility to public for multiple chats", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();

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

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId,
                title: "Test Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId,
                title: "Test Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        const result = await updateManyChatsVisibility({
            chatIds: [chatId1, chatId2],
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result.success).toBe(true);

        const { data: chats } = await supabase
            .from("chats")
            .select("visibility")
            .in("id", [chatId1, chatId2]);

        expect(chats).toHaveLength(2);
        expect(chats?.every(chat => chat.visibility === "public")).toBe(true);
    });

    it("should update visibility to private for multiple chats", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();

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

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId,
                title: "Test Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId,
                title: "Test Chat 2",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        const result = await updateManyChatsVisibility({
            chatIds: [chatId1, chatId2],
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(result.success).toBe(true);

        const { data: chats } = await supabase
            .from("chats")
            .select("visibility")
            .in("id", [chatId1, chatId2]);

        expect(chats).toHaveLength(2);
        expect(
            chats?.every(chat => chat.visibility === CHAT_VISIBILITY.PRIVATE),
        ).toBe(true);
    });

    it("should only update chats owned by the user", async () => {
        const userId1 = generateUserId();
        const email1 = generateUserEmail();
        const userId2 = generateUserId();
        const email2 = generateUserEmail();
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId1,
                name: "Test User 1",
                email: email1,
                image: null,
                role: USER_ROLE.USER,
            },
        });

        await supabase.from("users").insert([
            {
                id: userId1,
                email: email1,
                name: "Test User 1",
                role: USER_ROLE.USER,
            },
            {
                id: userId2,
                email: email2,
                name: "Test User 2",
                role: USER_ROLE.USER,
            },
        ]);

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId: userId1,
                title: "Test Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId: userId2,
                title: "Test Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        const result = await updateManyChatsVisibility({
            chatIds: [chatId1, chatId2],
            visibility: CHAT_VISIBILITY.PUBLIC,
        });

        expect(result.success).toBe(true);

        const { data: chat1 } = await supabase
            .from("chats")
            .select("visibility")
            .eq("id", chatId1)
            .single();

        const { data: chat2 } = await supabase
            .from("chats")
            .select("visibility")
            .eq("id", chatId2)
            .single();

        expect(chat1?.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        expect(chat2?.visibility).toBe(CHAT_VISIBILITY.PRIVATE);
    });
});

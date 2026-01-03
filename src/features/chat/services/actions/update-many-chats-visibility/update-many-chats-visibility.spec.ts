import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

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

    it("updates visibility to public for multiple chats", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId1 = generateUniqueChatId();
        const chatId2 = generateUniqueChatId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
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

        const result = await updateManyChatsVisibility({
            chatIds: [chatId1, chatId2],
            visibility: "public",
        });

        expect(result.success).toBe(true);

        const { data: chats } = await supabase
            .from("chats")
            .select("visibility")
            .in("id", [chatId1, chatId2]);

        expect(chats).toHaveLength(2);
        expect(chats?.every(chat => chat.visibility === "public")).toBe(true);
    });

    it("updates visibility to private for multiple chats", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId1 = generateUniqueChatId();
        const chatId2 = generateUniqueChatId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                name: "Test User",
                email,
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId,
                title: "Test Chat 1",
                visibility: "public",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId,
                title: "Test Chat 2",
                visibility: "public",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        const result = await updateManyChatsVisibility({
            chatIds: [chatId1, chatId2],
            visibility: "private",
        });

        expect(result.success).toBe(true);

        const { data: chats } = await supabase
            .from("chats")
            .select("visibility")
            .in("id", [chatId1, chatId2]);

        expect(chats).toHaveLength(2);
        expect(chats?.every(chat => chat.visibility === "private")).toBe(true);
    });

    it("only updates chats owned by the user", async () => {
        const userId1 = generateUniqueUserId();
        const email1 = generateUniqueEmail();
        const userId2 = generateUniqueUserId();
        const email2 = generateUniqueEmail();
        const chatId1 = generateUniqueChatId();
        const chatId2 = generateUniqueChatId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId1,
                name: "Test User 1",
                email: email1,
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert([
            {
                id: userId1,
                email: email1,
                name: "Test User 1",
                role: "user",
            },
            {
                id: userId2,
                email: email2,
                name: "Test User 2",
                role: "user",
            },
        ]);

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId: userId1,
                title: "Test Chat 1",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId: userId2,
                title: "Test Chat 2",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        const result = await updateManyChatsVisibility({
            chatIds: [chatId1, chatId2],
            visibility: "public",
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

        expect(chat1?.visibility).toBe("public");
        expect(chat2?.visibility).toBe("private");
    });
});

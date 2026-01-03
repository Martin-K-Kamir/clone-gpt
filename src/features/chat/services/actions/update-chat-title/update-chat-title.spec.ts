import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { supabase } from "@/services/supabase";

import { updateChatTitle } from "./update-chat-title";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("updateChatTitle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates chat title", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

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

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Original Title",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const newTitle = "New Title";
        const result = await updateChatTitle({
            chatId,
            newTitle,
        });

        expect(result.success).toBe(true);

        const { data } = await supabase
            .from("chats")
            .select("title")
            .eq("id", chatId)
            .single();

        expect(data?.title).toBe(newTitle);
    });

    it("truncates title longer than 25 characters", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

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

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Original Title",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const longTitle =
            "This is a very long title that exceeds 25 characters";
        const result = await updateChatTitle({
            chatId,
            newTitle: longTitle,
        });

        expect(result.success).toBe(true);

        const { data } = await supabase
            .from("chats")
            .select("title")
            .eq("id", chatId)
            .single();

        expect(data?.title).toBe("This is a very long title...");
        expect(data?.title.length).toBe(28);
    });

    it("does not update chat title if chat is not owned by user", async () => {
        const userId1 = generateUserId();
        const email1 = generateUserEmail();
        const userId2 = generateUserId();
        const email2 = generateUserEmail();
        const chatId = generateChatId();

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

        await supabase.from("chats").insert({
            id: chatId,
            userId: userId2,
            title: "Original Title",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const newTitle = "New Title";
        const result = await updateChatTitle({
            chatId,
            newTitle,
        });

        expect(result.success).toBe(true);

        const { data } = await supabase
            .from("chats")
            .select("title")
            .eq("id", chatId)
            .single();

        expect(data?.title).toBe("Original Title");
    });

    it("handles title exactly 25 characters", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

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

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Original Title",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const exactTitle = "1234567890123456789012345";
        const result = await updateChatTitle({
            chatId,
            newTitle: exactTitle,
        });

        expect(result.success).toBe(true);

        const { data } = await supabase
            .from("chats")
            .select("title")
            .eq("id", chatId)
            .single();

        expect(data?.title).toBe(exactTitle);
        expect(data?.title.length).toBe(25);
    });
});

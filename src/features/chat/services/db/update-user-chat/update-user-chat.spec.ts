import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { updateUserChat } from "./update-user-chat";

describe("updateUserChat", () => {
    it("updates chat title", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

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

        const newTitle = "Updated Title";
        const result = await updateUserChat({
            chatId,
            userId,
            data: { title: newTitle },
        });

        expect(result.title).toBe(newTitle);
    });

    it("updates chat visibility", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const result = await updateUserChat({
            chatId,
            userId,
            data: { visibility: "public" },
        });

        expect(result.visibility).toBe("public");
    });

    it("updates both title and visibility", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();

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

import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueMessageId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { updateUserChatMessage } from "./update-user-chat-message";

describe("updateUserChatMessage", () => {
    it("updates message content", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();
        const messageId = generateUniqueMessageId();

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

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "user",
            content: "Original content",
            metadata: {},
            parts: [{ type: "text", text: "Original content" }],
            createdAt: new Date().toISOString(),
        });

        const newContent = "Updated message content";
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: newContent }],
            metadata: {},
        };

        await updateUserChatMessage({
            chatId,
            userId,
            message: message as any,
        });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.content).toBe(newContent);
    });

    it("filters out non-text parts when extracting content", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const chatId = generateUniqueChatId();
        const messageId = generateUniqueMessageId();

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

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "user",
            content: "Original",
            metadata: {},
            parts: [{ type: "text", text: "Original" }],
            createdAt: new Date().toISOString(),
        });

        const message = {
            id: messageId,
            role: "user",
            parts: [
                { type: "text", text: "Hello" },
                { type: "file", fileId: "file-1" },
                { type: "text", text: " World" },
            ],
            metadata: {},
        };

        await updateUserChatMessage({
            chatId,
            userId,
            message: message as any,
        });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.content).toBe("Hello World");
    });
});

import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueMessageId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { storeUserChatMessage } from "./store-user-chat-message";

describe("storeUserChatMessage", () => {
    it("stores a message in the database", async () => {
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

        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Test message" }],
            metadata: {},
        };

        await storeUserChatMessage({ chatId, userId, message: message as any });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.id).toBe(messageId);
        expect(data?.chatId).toBe(chatId);
        expect(data?.userId).toBe(userId);
        expect(data?.role).toBe("user");
        expect(data?.content).toBe("Test message");
    });

    it("uses createdAt from metadata when provided", async () => {
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

        const createdAt = "2024-01-01T00:00:00Z";
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Test" }],
            metadata: { createdAt },
        };

        await storeUserChatMessage({ chatId, userId, message: message as any });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.createdAt).toMatch(/^2024-01-01T00:00:00/);
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

        await storeUserChatMessage({ chatId, userId, message: message as any });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.content).toBe("Hello World");
    });
});

import {
    generateChatId,
    generateMessageId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { CHAT_ROLE, CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { storeUserChatMessage } from "./store-user-chat-message";

describe("storeUserChatMessage", () => {
    it("should store a message", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const message = {
            id: messageId,
            role: CHAT_ROLE.USER,
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
        expect(data?.role).toBe(CHAT_ROLE.USER);
        expect(data?.content).toBe("Test message");
    });

    it("should use createdAt from metadata when provided", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const createdAt = "2024-01-01T00:00:00Z";
        const message = {
            id: messageId,
            role: CHAT_ROLE.USER,
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

    it("should filter out non-text parts when extracting content", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const message = {
            id: messageId,
            role: CHAT_ROLE.USER,
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

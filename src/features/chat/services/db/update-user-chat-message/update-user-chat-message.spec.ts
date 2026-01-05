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

import { updateUserChatMessage } from "./update-user-chat-message";

describe("updateUserChatMessage", () => {
    it("should update message content", async () => {
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

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: CHAT_ROLE.USER,
            content: "Original content",
            metadata: {},
            parts: [{ type: "text", text: "Original content" }],
            createdAt: new Date().toISOString(),
        });

        const newContent = "Updated message content";
        const message = {
            id: messageId,
            role: CHAT_ROLE.USER,
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

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: CHAT_ROLE.USER,
            content: "Original",
            metadata: {},
            parts: [{ type: "text", text: "Original" }],
            createdAt: new Date().toISOString(),
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

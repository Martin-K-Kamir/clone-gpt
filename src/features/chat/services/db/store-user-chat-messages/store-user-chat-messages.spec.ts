import {
    generateChatId,
    generateMessageId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { supabase } from "@/services/supabase";

import { storeUserChatMessages } from "./store-user-chat-messages";

describe("storeUserChatMessages", () => {
    it("stores multiple messages", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();

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

        const messages = [
            {
                id: messageId1,
                role: "user" as const,
                parts: [{ type: "text" as const, text: "Message 1" }],
                metadata: {},
            },
            {
                id: messageId2,
                role: "assistant" as const,
                parts: [{ type: "text" as const, text: "Message 2" }],
                metadata: {},
            },
        ] as any;

        await storeUserChatMessages({ chatId, userId, messages });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .in("id", [messageId1, messageId2])
            .order("createdAt", { ascending: true });

        expect(data).toHaveLength(2);
        expect(data?.[0].id).toBe(messageId1);
        expect(data?.[1].id).toBe(messageId2);
    });

    it("uses createdAt from message when preserveCreatedAt is true", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

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
        const messages = [
            {
                id: messageId,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                metadata: {},
                createdAt,
            },
        ] as any;

        await storeUserChatMessages({
            chatId,
            userId,
            messages,
            preserveCreatedAt: true,
        });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.createdAt).toBeDefined();
        if (data?.createdAt) {
            expect(data.createdAt).toMatch(/^2024-01-01T00:00:00/);
        }
    });

    it("uses createdAt from metadata when message createdAt is not provided and preserveCreatedAt is true", async () => {
        const userId = generateUserId();
        const email = generateUserEmail();
        const chatId = generateChatId();
        const messageId = generateMessageId();

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
        const messages = [
            {
                id: messageId,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                metadata: { createdAt },
            },
        ] as any;

        await storeUserChatMessages({
            chatId,
            userId,
            messages,
            preserveCreatedAt: true,
        });

        const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("id", messageId)
            .single();

        expect(data).not.toBeNull();
        expect(data?.createdAt).toBeDefined();
        if (data?.createdAt) {
            expect(data.createdAt).toMatch(/^2024-01-01T00:00:00/);
        }
    });
});

import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueMessageId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { storeUserChatMessages } from "@/features/chat/services/db/store-user-chat-messages";

import { supabase } from "@/services/supabase";

import { duplicateUserChat } from "./duplicate-user-chat";

describe("duplicateUserChat", () => {
    it("duplicates chat with messages", async () => {
        const userId = generateUniqueUserId();
        const email = generateUniqueEmail();
        const originalChatId = generateUniqueChatId();
        const newChatId = generateUniqueChatId();
        const messageId1 = generateUniqueMessageId();
        const messageId2 = generateUniqueMessageId();

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert({
            id: originalChatId,
            userId,
            title: "Original Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const createdAt1 = new Date().toISOString();
        const createdAt2 = new Date(Date.now() + 1000).toISOString();

        await storeUserChatMessages({
            chatId: originalChatId,
            userId,
            messages: [
                {
                    id: messageId1,
                    role: "user" as const,
                    parts: [{ type: "text" as const, text: "Message 1" }],
                    metadata: { createdAt: createdAt1 },
                },
                {
                    id: messageId2,
                    role: "assistant" as const,
                    parts: [{ type: "text" as const, text: "Message 2" }],
                    metadata: { createdAt: createdAt2 },
                },
            ] as any,
            preserveCreatedAt: true,
        });

        const result = await duplicateUserChat({
            chatId: originalChatId,
            newChatId,
            userId,
        });

        expect(result).not.toBeNull();
        expect(result?.id).toBe(newChatId);
        expect(result?.userId).toBe(userId);

        const { data: originalChat } = await supabase
            .from("chats")
            .select("*")
            .eq("id", originalChatId)
            .single();

        expect(originalChat).not.toBeNull();

        const { data: originalMessages } = await supabase
            .from("messages")
            .select("*")
            .eq("chatId", originalChatId)
            .order("createdAt", { ascending: true });

        expect(originalMessages).toHaveLength(2);

        const { data: newChat } = await supabase
            .from("chats")
            .select("*")
            .eq("id", newChatId)
            .single();

        expect(newChat).not.toBeNull();
        expect(newChat?.userId).toBe(userId);

        const { data: newMessages } = await supabase
            .from("messages")
            .select("*")
            .eq("chatId", newChatId)
            .order("createdAt", { ascending: true });

        expect(newMessages).toHaveLength(2);

        const message1 = newMessages?.find(msg => msg.content === "Message 1");
        const message2 = newMessages?.find(msg => msg.content === "Message 2");

        expect(message1).toBeDefined();
        expect(message2).toBeDefined();
        expect(message1?.content).toBe("Message 1");
        expect(message2?.content).toBe("Message 2");
    });
});

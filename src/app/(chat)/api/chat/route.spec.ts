import {
    generateChatId,
    generateMessageId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { restoreSeedData } from "@/vitest/helpers/restore-seed-data";
import { simulateReadableStream, streamText } from "ai";
import { MockLanguageModelV2 } from "ai/test";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_TRIGGER } from "@/features/chat/lib/constants";

import { supabase } from "@/services/supabase";

import { POST } from "./route";

const mockModel = new MockLanguageModelV2({
    doStream: async () => ({
        stream: simulateReadableStream({
            chunks: [
                { type: "text-start", id: "text-1" },
                { type: "text-delta", id: "text-1", delta: "Hello" },
                { type: "text-delta", id: "text-1", delta: " there!" },
                { type: "text-end", id: "text-1" },
                {
                    type: "finish",
                    finishReason: "stop",
                    usage: {
                        inputTokens: 10,
                        outputTokens: 5,
                        totalTokens: 15,
                    },
                },
            ],
        }),
    }),
});

vi.mock("next/cache", async () => {
    const actual = await vi.importActual("next/cache");
    return {
        ...actual,
        cacheTag: vi.fn(),
        revalidateTag: vi.fn(),
        updateTag: vi.fn(),
    };
});

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
    openai: vi.fn(() => mockModel),
}));

vi.mock("openai", () => {
    const mockChatCompletions = {
        create: vi.fn(),
    };
    const mockChat = {
        completions: mockChatCompletions,
    };
    const mockClient = {
        chat: mockChat,
    };

    return {
        default: class {
            constructor() {
                return mockClient;
            }
        },
        OpenAI: class {
            constructor() {
                return mockClient;
            }
        },
    };
});

vi.mock("ai", async () => {
    return await vi.importActual("ai");
});

vi.mock("@/features/chat/services/ai", () => ({
    generateChatTitle: vi.fn().mockResolvedValue("Test Chat"),
}));

vi.mock("@/features/chat/lib/ai/tools", () => ({
    chatTools: vi.fn(() => ({})),
}));

vi.mock("@/features/chat/lib/ai/system-messages", () => ({
    chatSystemMessage: vi.fn(() => "System message"),
}));

beforeEach(async () => {
    vi.clearAllMocks();
    try {
        await restoreSeedData();
    } catch (error) {
        console.error("Failed to restore seed data:", error);
        throw error;
    }
});

describe("POST /api/chat", () => {
    const userId = generateUserId();
    const email = generateUserEmail();

    const createMessage = (text?: string) => ({
        id: generateMessageId(),
        role: "user" as const,
        parts: [
            {
                type: "text",
                text:
                    text ||
                    "Hello, test message with enough characters to meet the minimum requirement",
            },
        ],
        metadata: {
            role: "user",
            createdAt: new Date().toISOString(),
        },
    });

    const consumeStream = async (response: Response) => {
        if (!response.ok) return;
        if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) decoder.decode(value, { stream: true });
            }
        }
    };

    const waitForMessages = async (
        chatId: string,
        expectedCount: number,
        timeout = 2000,
    ) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const { data: messages } = await supabase
                .from("messages")
                .select("*")
                .eq("chatId", chatId);
            if (messages && messages.length >= expectedCount) {
                return messages;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .eq("chatId", chatId);
        return messages || [];
    };

    const waitForRegeneratedMessage = async (
        chatId: string,
        oldMessageId: string,
        timeout = 1500,
    ) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const { data: messages } = await supabase
                .from("messages")
                .select("*")
                .eq("chatId", chatId)
                .order("createdAt", { ascending: true });
            if (messages) {
                const assistantMessages = messages.filter(
                    m => m.role === "assistant",
                );
                const lastAssistant =
                    assistantMessages[assistantMessages.length - 1];
                if (lastAssistant && lastAssistant.id !== oldMessageId) {
                    return messages;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        const { data: messages } = await supabase
            .from("messages")
            .select("*")
            .eq("chatId", chatId)
            .order("createdAt", { ascending: true });
        return messages || [];
    };

    beforeEach(async () => {
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Test User",
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").upsert(
            {
                id: userId,
                email,
                name: "Test User",
                role: "user",
            },
            { onConflict: "id" },
        );

        await supabase
            .from("user_messages_rate_limits")
            .delete()
            .eq("userId", userId);
    });

    it("creates new chat and stores messages after streaming completes", async () => {
        const chatId = generateChatId();
        const message = createMessage();

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
                message,
                userChatPreferences: null,
                chatId,
                trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
                body: {},
            }),
        });

        const response = await POST(request);
        expect(response).toBeInstanceOf(Response);
        expect(response.ok).toBe(true);

        await consumeStream(response);
        const messages = await waitForMessages(chatId, 2);

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe("user");
        expect(messages[1].role).toBe("assistant");

        const { data: chat } = await supabase
            .from("chats")
            .select("*")
            .eq("id", chatId)
            .maybeSingle();

        expect(chat).not.toBeNull();
        expect(chat?.userId).toBe(userId);
    });

    it("uses existing chat and stores messages after streaming completes", async () => {
        const chatId = generateChatId();
        const message = createMessage();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Existing Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
                message,
                userChatPreferences: null,
                chatId,
                trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
                body: {},
            }),
        });

        const response = await POST(request);
        expect(response).toBeInstanceOf(Response);
        expect(response.ok).toBe(true);

        await consumeStream(response);
        const messages = await waitForMessages(chatId, 2);

        expect(messages).toHaveLength(2);
        expect(messages[0].role).toBe("user");
        expect(messages[1].role).toBe("assistant");
    });

    it("enforces rate limits correctly", async () => {
        const { data: user } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (!user) throw new Error("User not found");

        const { entitlementsByUserRole } = await import(
            "@/features/user/lib/constants/entitlements"
        );
        const maxMessages = entitlementsByUserRole[user.role].maxMessages;

        const periodStart = new Date();
        periodStart.setSeconds(0, 0);
        const periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);

        await supabase.from("user_messages_rate_limits").insert({
            userId,
            messagesCounter: maxMessages + 1,
            tokensCounter: 100000,
            isOverLimit: true,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
        });

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
                message: createMessage(),
                userChatPreferences: null,
                chatId: generateChatId(),
                trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
                body: {},
            }),
        });

        const response = await POST(request);
        expect(response).toBeInstanceOf(Response);
        expect(response.ok).toBe(false);

        const responseData = await response.json();
        expect(responseData.success).toBe(false);
    });

    it("duplicates public chat when user is not owner", async () => {
        const originalChatId = generateChatId();
        const newChatId = generateChatId();
        const ownerUserId = generateUserId();

        await supabase.from("users").upsert(
            {
                id: ownerUserId,
                email: generateUserEmail(),
                name: "Owner",
                role: "user",
            },
            { onConflict: "id" },
        );

        await supabase.from("chats").insert({
            id: originalChatId,
            userId: ownerUserId,
            title: "Public Chat",
            visibility: "public",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: generateMessageId(),
            chatId: originalChatId,
            userId: ownerUserId,
            role: "user",
            content: "Original message",
            metadata: { role: "user", createdAt: new Date().toISOString() },
            parts: [
                {
                    type: "text",
                    text: "Original message with enough characters to meet the minimum requirement",
                },
            ],
            createdAt: new Date().toISOString(),
        });

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
                message: createMessage(
                    "New message with enough characters to meet the minimum requirement",
                ),
                userChatPreferences: null,
                chatId: originalChatId,
                newChatId,
                trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
                body: {},
            }),
        });

        const response = await POST(request);
        expect(response).toBeInstanceOf(Response);
        expect(response.ok).toBe(true);

        await consumeStream(response);

        const { data: duplicatedChat } = await supabase
            .from("chats")
            .select("*")
            .eq("id", newChatId)
            .maybeSingle();

        expect(duplicatedChat).not.toBeNull();
        expect(duplicatedChat?.userId).toBe(userId);

        const messages = await waitForMessages(newChatId, 1);
        expect(messages.length).toBeGreaterThan(0);
    });

    it("handles message regeneration correctly", async () => {
        const chatId = generateChatId();
        const messageId = generateMessageId();
        const userMessageText =
            "First message with enough characters to meet the minimum requirement";

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert([
            {
                id: generateMessageId(),
                chatId,
                userId,
                role: "user",
                content: "First message",
                metadata: { role: "user", createdAt: new Date().toISOString() },
                parts: [{ type: "text", text: userMessageText }],
                createdAt: new Date().toISOString(),
            },
            {
                id: messageId,
                chatId,
                userId,
                role: "assistant",
                content: "Original response",
                metadata: {
                    role: "assistant",
                    createdAt: new Date().toISOString(),
                    model: "gpt-4o",
                    totalTokens: 10,
                    isUpvoted: false,
                    isDownvoted: false,
                },
                parts: [
                    {
                        type: "text",
                        text: "Original response with enough characters to meet the minimum requirement",
                    },
                ],
                createdAt: new Date().toISOString(),
            },
        ]);

        const request = new NextRequest("http://localhost/api/chat", {
            method: "POST",
            body: JSON.stringify({
                message: createMessage(userMessageText),
                userChatPreferences: null,
                chatId,
                messageId,
                trigger: CHAT_TRIGGER.REGENERATE_MESSAGE,
                body: {
                    regeneratedMessageRole: "assistant",
                },
            }),
        });

        const response = await POST(request);
        expect(response).toBeInstanceOf(Response);
        expect(response.ok).toBe(true);

        await consumeStream(response);
        const messages = await waitForRegeneratedMessage(chatId, messageId);

        const assistantMessages = messages.filter(m => m.role === "assistant");
        const lastAssistantMessage =
            assistantMessages[assistantMessages.length - 1];

        expect(lastAssistantMessage).not.toBeNull();
        expect(lastAssistantMessage.id).not.toBe(messageId);
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { storeUserChatMessages } from "./store-user-chat-messages";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;
const messageId1 = "40000000-0000-0000-0000-000000000abc" as DBChatMessageId;
const messageId2 = "40000000-0000-0000-0000-000000000def" as DBChatMessageId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("storeUserChatMessages", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when chatId is invalid", async () => {
        await expect(
            storeUserChatMessages({
                chatId: "not-a-uuid" as any,
                userId,
                messages: [],
            }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            storeUserChatMessages({
                chatId,
                userId: "not-a-uuid" as any,
                messages: [],
            }),
        ).rejects.toThrow();
    });

    it("stores multiple messages", async () => {
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Message 1" }],
            },
            {
                id: messageId2,
                role: "assistant",
                parts: [{ type: "text", text: "Message 2" }],
            },
        ] as any;

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessages({ chatId, userId, messages }),
        ).resolves.toBeUndefined();
    });

    it("uses createdAt from message when preserveCreatedAt is true", async () => {
        const createdAt = "2024-01-01T00:00:00Z";
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                createdAt,
            },
        ] as any;

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessages({
                chatId,
                userId,
                messages,
                preserveCreatedAt: true,
            }),
        ).resolves.toBeUndefined();
    });

    it("uses createdAt from metadata when message createdAt is not provided", async () => {
        const createdAt = "2024-01-01T00:00:00Z";
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
                metadata: { createdAt },
            },
        ] as any;

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessages({
                chatId,
                userId,
                messages,
                preserveCreatedAt: true,
            }),
        ).resolves.toBeUndefined();
    });

    it("uses generated fallback createdAt when preserveCreatedAt is false", async () => {
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
            },
        ] as any;

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessages({
                chatId,
                userId,
                messages,
                preserveCreatedAt: false,
            }),
        ).resolves.toBeUndefined();
    });

    it("filters out non-text parts when extracting content", async () => {
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [
                    { type: "text", text: "Hello" },
                    { type: "file", fileId: "file-1" },
                    { type: "text", text: " World" },
                ],
            },
        ] as any;

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessages({ chatId, userId, messages }),
        ).resolves.toBeUndefined();
    });

    it("throws on insert error", async () => {
        const messages = [
            {
                id: messageId1,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
            },
        ] as any;

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
        });

        await expect(
            storeUserChatMessages({ chatId, userId, messages }),
        ).rejects.toThrow("Failed to store chat message");
    });
});

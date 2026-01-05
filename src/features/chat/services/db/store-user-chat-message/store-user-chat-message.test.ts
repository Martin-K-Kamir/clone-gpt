import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { storeUserChatMessage } from "./store-user-chat-message";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;
const messageId = "40000000-0000-0000-0000-000000000abc" as DBChatMessageId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("storeUserChatMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when chatId is invalid", async () => {
        await expect(
            storeUserChatMessage({
                chatId: "not-a-uuid" as any,
                userId,
                message: {
                    id: messageId,
                    role: "user",
                    parts: [{ type: "text", text: "Hello" }],
                } as any,
            }),
        ).rejects.toThrow();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            storeUserChatMessage({
                chatId,
                userId: "not-a-uuid" as any,
                message: {
                    id: messageId,
                    role: "user",
                    parts: [{ type: "text", text: "Hello" }],
                } as any,
            }),
        ).rejects.toThrow();
    });

    it("should store message with text parts", async () => {
        const message = {
            id: messageId,
            role: "user",
            parts: [
                { type: "text", text: "Hello" },
                { type: "text", text: " World" },
            ],
            metadata: {},
        };

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessage({ chatId, userId, message: message as any }),
        ).resolves.toBeUndefined();
    });

    it("should use createdAt from metadata when provided", async () => {
        const createdAt = "2024-01-01T00:00:00Z";
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Hello" }],
            metadata: { createdAt },
        };

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessage({ chatId, userId, message: message as any }),
        ).resolves.toBeUndefined();
    });

    it("should filter out non-text parts when extracting content", async () => {
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

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: null }),
        });

        await expect(
            storeUserChatMessage({ chatId, userId, message: message as any }),
        ).resolves.toBeUndefined();
    });

    it("should throw when storage fails", async () => {
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Hello" }],
            metadata: {},
        };

        mocks.from.mockReturnValue({
            insert: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
        });

        await expect(
            storeUserChatMessage({ chatId, userId, message: message as any }),
        ).rejects.toThrow("Failed to store chat message");
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { updateUserChatMessage } from "./update-user-chat-message";

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

describe("updateUserChatMessage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when chatId is invalid", async () => {
        await expect(
            updateUserChatMessage({
                chatId: "not-a-uuid" as any,
                userId,
                message: {
                    id: messageId,
                    role: "user",
                    parts: [{ type: "text", text: "Updated" }],
                } as any,
            }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            updateUserChatMessage({
                chatId,
                userId: "not-a-uuid" as any,
                message: {
                    id: messageId,
                    role: "user",
                    parts: [{ type: "text", text: "Updated" }],
                } as any,
            }),
        ).rejects.toThrow();
    });

    it("updates message with text parts", async () => {
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Updated message" }],
            metadata: {},
        };

        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            }),
        });

        await expect(
            updateUserChatMessage({ chatId, userId, message: message as any }),
        ).resolves.toBeUndefined();
    });

    it("filters out non-text parts when extracting content", async () => {
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
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            }),
        });

        await expect(
            updateUserChatMessage({ chatId, userId, message: message as any }),
        ).resolves.toBeUndefined();
    });

    it("throws when update fails", async () => {
        const message = {
            id: messageId,
            role: "user",
            parts: [{ type: "text", text: "Updated" }],
            metadata: {},
        };

        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({
                            error: { message: "fail" },
                        }),
                    }),
                }),
            }),
        });

        await expect(
            updateUserChatMessage({ chatId, userId, message: message as any }),
        ).rejects.toThrow("Failed to update chat message");
    });
});

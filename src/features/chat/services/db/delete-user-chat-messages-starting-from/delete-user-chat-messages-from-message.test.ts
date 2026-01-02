import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId, DBChatMessageId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { deleteUserChatMessagesStartingFrom } from "./delete-user-chat-messages-from-message";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const messageId = "40000000-0000-0000-0000-000000000abc" as DBChatMessageId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("deleteUserChatMessagesStartingFrom", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when messageId is invalid", async () => {
        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId: "not-a-uuid" as any,
                chatId,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("throws when chatId is invalid", async () => {
        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId,
                chatId: "not-a-uuid" as any,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId,
                chatId,
                userId: "not-a-uuid" as any,
            }),
        ).rejects.toThrow();
    });

    it("throws when target message not found", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId,
                chatId,
                userId,
            }),
        ).rejects.toThrow("Target message not found");
    });

    it("succeeds when target message exists and delete works", async () => {
        const targetCreatedAt = "2024-01-02T00:00:00Z";

        const selectChain = {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { createdAt: targetCreatedAt },
                            error: null,
                        }),
                    }),
                }),
            }),
        };

        const deleteChain = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    gte: vi.fn().mockResolvedValue({ error: null }),
                }),
            }),
        };

        const calls: any[] = [selectChain, deleteChain];
        mocks.from.mockImplementation(() => calls.shift() || selectChain);

        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId,
                chatId,
                userId,
            }),
        ).resolves.not.toThrow();
    });

    it("throws on delete error", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { createdAt: "2024-01-02T00:00:00Z" },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const selectChain = {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { createdAt: "2024-01-02T00:00:00Z" },
                            error: null,
                        }),
                    }),
                }),
            }),
        };

        const deleteChain = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    gte: vi.fn().mockResolvedValue({
                        error: { message: "fail" },
                    }),
                }),
            }),
        };

        const calls: any[] = [selectChain, deleteChain];
        mocks.from.mockImplementation(() => calls.shift() || selectChain);

        await expect(
            deleteUserChatMessagesStartingFrom({
                messageId,
                chatId,
                userId,
            }),
        ).rejects.toThrow("Failed to delete chat messages");
    });
});

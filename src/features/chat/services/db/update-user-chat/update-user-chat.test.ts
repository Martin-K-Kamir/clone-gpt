import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { updateUserChat } from "./update-user-chat";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("updateUserChat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when chatId is invalid", async () => {
        await expect(
            updateUserChat({
                chatId: "not-a-uuid" as any,
                userId,
                data: { title: "New Title" },
            }),
        ).rejects.toThrow();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            updateUserChat({
                chatId,
                userId: "not-a-uuid" as any,
                data: { title: "New Title" },
            }),
        ).rejects.toThrow();
    });

    it("should throw when data is invalid", async () => {
        await expect(
            updateUserChat({
                chatId,
                userId,
                data: { title: null } as any,
            }),
        ).rejects.toThrow();
    });

    it("should update chat title", async () => {
        const updatedChat = {
            id: chatId,
            userId,
            title: "New Title",
            visibility: CHAT_VISIBILITY.PRIVATE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            visibleAt: new Date().toISOString(),
        };

        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: updatedChat,
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await updateUserChat({
            chatId,
            userId,
            data: { title: "New Title" },
        });

        expect(result).toEqual(updatedChat);
    });

    it("should update chat visibility", async () => {
        const updatedChat = {
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PUBLIC,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            visibleAt: new Date().toISOString(),
        };

        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: updatedChat,
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await updateUserChat({
            chatId,
            userId,
            data: { visibility: CHAT_VISIBILITY.PUBLIC },
        });

        expect(result).toEqual(updatedChat);
    });

    it("should throw when update fails", async () => {
        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: "fail" },
                            }),
                        }),
                    }),
                }),
            }),
        });

        await expect(
            updateUserChat({
                chatId,
                userId,
                data: { title: "New Title" },
            }),
        ).rejects.toThrow("Chat update failed");
    });
});

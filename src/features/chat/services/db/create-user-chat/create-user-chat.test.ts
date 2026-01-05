import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { createUserChat } from "./create-user-chat";

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

describe("createUserChat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when chatId is invalid", async () => {
        await expect(
            createUserChat({
                chatId: "not-a-uuid" as any,
                userId,
                title: "Test",
            }),
        ).rejects.toThrow();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            createUserChat({
                chatId,
                userId: "not-a-uuid" as any,
                title: "Test",
            }),
        ).rejects.toThrow();
    });

    it("should throw when title is invalid", async () => {
        await expect(
            createUserChat({
                chatId,
                userId,
                title: null as any,
            }),
        ).rejects.toThrow();
    });

    it("should create chat on success", async () => {
        const mockChat = {
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mocks.from.mockImplementation(() => ({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: mockChat,
                        error: null,
                    }),
                }),
            }),
        }));

        const result = await createUserChat({
            chatId,
            userId,
            title: "Test Chat",
        });

        expect(result).toEqual(mockChat);
    });

    it("should throw when creation fails", async () => {
        mocks.from.mockImplementation(() => ({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: "fail" },
                    }),
                }),
            }),
        }));

        await expect(
            createUserChat({
                chatId,
                userId,
                title: "Test",
            }),
        ).rejects.toThrow("Chat insert failed");
    });

    it("should throw when data is null and throwOnNotFound is true", async () => {
        mocks.from.mockImplementation(() => ({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        }));

        await expect(
            createUserChat({
                chatId,
                userId,
                title: "Test",
                throwOnNotFound: true,
            }),
        ).rejects.toThrow("Chat not found");
    });

    it("should return null when data is null and throwOnNotFound is false", async () => {
        mocks.from.mockImplementation(() => ({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        }));

        const result = await createUserChat({
            chatId,
            userId,
            title: "Test",
            throwOnNotFound: false,
        });

        expect(result).toBeNull();
    });
});

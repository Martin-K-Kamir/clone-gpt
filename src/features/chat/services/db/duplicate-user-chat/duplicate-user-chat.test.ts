import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { duplicateUserChat } from "./duplicate-user-chat";

const chatId = "30000000-0000-0000-0000-000000000abc" as DBChatId;
const newChatId = "30000000-0000-0000-0000-000000000def" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    getUserChatById: vi.fn(),
    uncachedGetUserChatMessages: vi.fn(),
    createUserChat: vi.fn(),
    duplicateMessages: vi.fn(),
    storeUserChatMessages: vi.fn(),
}));

vi.mock("@/features/chat/services/db/get-user-chat-by-id", () => ({
    getUserChatById: mocks.getUserChatById,
}));

vi.mock("@/features/chat/services/db/get-user-chat-messages", () => ({
    uncachedGetUserChatMessages: mocks.uncachedGetUserChatMessages,
}));

vi.mock("@/features/chat/services/db/create-user-chat", () => ({
    createUserChat: mocks.createUserChat,
}));

vi.mock("@/features/chat/lib/utils", () => ({
    duplicateMessages: mocks.duplicateMessages,
}));

vi.mock("@/features/chat/services/db/store-user-chat-messages", () => ({
    storeUserChatMessages: mocks.storeUserChatMessages,
}));

describe("duplicateUserChat", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when chatId is invalid", async () => {
        await expect(
            duplicateUserChat({
                chatId: "not-a-uuid" as any,
                newChatId,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("throws when newChatId is invalid", async () => {
        await expect(
            duplicateUserChat({
                chatId,
                newChatId: "not-a-uuid" as any,
                userId,
            }),
        ).rejects.toThrow();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            duplicateUserChat({
                chatId,
                newChatId,
                userId: "not-a-uuid" as any,
            }),
        ).rejects.toThrow();
    });

    it("returns null when original chat not found and throwOnNotFound is false", async () => {
        mocks.getUserChatById.mockResolvedValue(null);

        const result = await duplicateUserChat({
            chatId,
            newChatId,
            userId,
            throwOnNotFound: false,
        });

        expect(result).toBeNull();
        expect(mocks.createUserChat).not.toHaveBeenCalled();
    });

    it("duplicates chat with messages", async () => {
        const originalChat = {
            id: chatId,
            userId,
            title: "Original Chat",
            visibility: "private",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            visibleAt: new Date().toISOString(),
        };

        const originalMessages = [
            {
                id: "msg1",
                role: "user",
                content: "Hello",
                parts: [],
            },
            {
                id: "msg2",
                role: "assistant",
                content: "Hi",
                parts: [],
            },
        ] as any;

        const duplicatedMessages = [
            {
                id: "new-msg1",
                role: "user",
                content: "Hello",
                parts: [],
            },
            {
                id: "new-msg2",
                role: "assistant",
                content: "Hi",
                parts: [],
            },
        ] as any;

        const newChat = {
            id: newChatId,
            userId,
            title: "Original Chat",
            visibility: "private",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            visibleAt: new Date().toISOString(),
        };

        mocks.getUserChatById.mockResolvedValue(originalChat);
        mocks.uncachedGetUserChatMessages.mockResolvedValue({
            data: originalMessages,
        });
        mocks.createUserChat.mockResolvedValue(newChat);
        mocks.duplicateMessages.mockResolvedValue(duplicatedMessages);
        mocks.storeUserChatMessages.mockResolvedValue(undefined);

        const result = await duplicateUserChat({
            chatId,
            newChatId,
            userId,
        });

        expect(result).toEqual(newChat);
    });

    it("duplicates chat without messages", async () => {
        const originalChat = {
            id: chatId,
            userId,
            title: "Empty Chat",
            visibility: "private",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            visibleAt: new Date().toISOString(),
        };

        const newChat = {
            id: newChatId,
            userId,
            title: "Empty Chat",
            visibility: "private",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            visibleAt: new Date().toISOString(),
        };

        mocks.getUserChatById.mockResolvedValue(originalChat);
        mocks.uncachedGetUserChatMessages.mockResolvedValue({ data: [] });
        mocks.createUserChat.mockResolvedValue(newChat);

        const result = await duplicateUserChat({
            chatId,
            newChatId,
            userId,
        });

        expect(result).toEqual(newChat);
        expect(mocks.duplicateMessages).not.toHaveBeenCalled();
        expect(mocks.storeUserChatMessages).not.toHaveBeenCalled();
    });
});

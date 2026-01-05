import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    CHAT_VISIBILITY,
    INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
} from "@/features/chat/lib/constants";
import type { DBChat } from "@/features/chat/lib/types";
import { getUserChatById } from "@/features/chat/services/api";

import { handleUpdateChatFinish } from "./handle-update-chat-finish";

vi.mock("@/features/chat/services/api", () => ({
    getUserChatById: vi.fn(),
}));

describe("handleUpdateChatFinish", () => {
    const chatId = generateChatId();
    const userId = generateUserId();
    const mockChat: DBChat = {
        id: chatId,
        userId,
        title: "Test Chat",
        visibility: CHAT_VISIBILITY.PRIVATE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date(Date.now() - 1000).toISOString(),
        visibleAt: new Date().toISOString(),
    };

    const mockChatCacheSync = {
        updateChats: vi.fn(),
        upsertInitialUserChatsSearch: vi.fn(),
    };

    const mockChatSidebarContext = {
        scrollHistoryToTop: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getUserChatById).mockResolvedValue(mockChat as any);
    });

    it("should scroll to top, update cache, fetch chat, and upsert search", async () => {
        await handleUpdateChatFinish({
            chatCacheSync: mockChatCacheSync as any,
            chatSidebarContext: mockChatSidebarContext as any,
            chatId,
        });

        expect(mockChatSidebarContext.scrollHistoryToTop).toHaveBeenCalled();
        expect(mockChatCacheSync.updateChats).toHaveBeenCalledWith({
            chatId,
            chat: {
                updatedAt: expect.any(String),
            },
        });
        expect(getUserChatById).toHaveBeenCalledWith({ chatId });
        expect(
            mockChatCacheSync.upsertInitialUserChatsSearch,
        ).toHaveBeenCalledWith({
            chatId,
            chat: {
                ...mockChat,
                updatedAt: expect.any(String),
            } as any,
            limit: INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
        });
    });

    it("should use current timestamp for updatedAt", async () => {
        const before = new Date().toISOString();

        await handleUpdateChatFinish({
            chatCacheSync: mockChatCacheSync as any,
            chatSidebarContext: mockChatSidebarContext as any,
            chatId,
        });

        const after = new Date().toISOString();

        const updateChatsCall = mockChatCacheSync.updateChats.mock.calls[0][0];
        const updatedAt = updateChatsCall.chat.updatedAt;

        expect(updatedAt >= before).toBe(true);
        expect(updatedAt <= after).toBe(true);
    });

    it("should merge updatedAt with fetched chat in upsert call", async () => {
        await handleUpdateChatFinish({
            chatCacheSync: mockChatCacheSync as any,
            chatSidebarContext: mockChatSidebarContext as any,
            chatId,
        });

        const upsertCall =
            mockChatCacheSync.upsertInitialUserChatsSearch.mock.calls[0][0];
        const updatedAt = upsertCall.chat.updatedAt;

        expect(upsertCall.chat).toEqual({
            ...mockChat,
            updatedAt,
        });
        expect(updatedAt).toBeDefined();
        expect(typeof updatedAt).toBe("string");
    });
});

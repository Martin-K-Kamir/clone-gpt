import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    CHAT_VISIBILITY,
    INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
} from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import { getUserChatById } from "@/features/chat/services/api";

import { handleNewChatFinish } from "./handle-new-chat-finish";

vi.mock("@/features/chat/services/api", () => ({
    getUserChatById: vi.fn(),
}));

describe("handleNewChatFinish", () => {
    const chatId = generateChatId();
    const userId = generateUserId();
    const mockChat: DBChat = {
        id: chatId,
        userId,
        title: "Test Chat",
        visibility: CHAT_VISIBILITY.PRIVATE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibleAt: new Date().toISOString(),
    };

    const mockChatCacheSync = {
        addChat: vi.fn(),
        addToInitialUserChatsSearch: vi.fn(),
    };

    const mockHistoryReplaceState = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        if (typeof window !== "undefined") {
            window.history.replaceState = mockHistoryReplaceState;
        } else {
            global.window = {
                history: {
                    replaceState: mockHistoryReplaceState,
                },
            } as any;
        }
        vi.mocked(getUserChatById).mockResolvedValue(mockChat as any);
    });

    it("should fetch chat and update history and cache", async () => {
        await handleNewChatFinish({
            chatCacheSync: mockChatCacheSync as any,
            chatId,
        });

        expect(getUserChatById).toHaveBeenCalledWith({ chatId });
        expect(mockHistoryReplaceState).toHaveBeenCalledWith(
            {},
            "",
            `/chat/${chatId}`,
        );
        expect(mockChatCacheSync.addChat).toHaveBeenCalledWith({
            chat: mockChat as any,
        });
        expect(
            mockChatCacheSync.addToInitialUserChatsSearch,
        ).toHaveBeenCalledWith({
            chat: mockChat as any,
            limit: INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
        });
    });

    it("should handle different chat IDs", async () => {
        const differentChatId = generateChatId();
        const differentChat: DBChat = {
            ...mockChat,
            id: differentChatId,
        };

        vi.mocked(getUserChatById).mockResolvedValue(differentChat as any);

        await handleNewChatFinish({
            chatCacheSync: mockChatCacheSync as any,
            chatId: differentChatId,
        });

        expect(getUserChatById).toHaveBeenCalledWith({
            chatId: differentChatId,
        });
        expect(mockHistoryReplaceState).toHaveBeenCalledWith(
            {},
            "",
            `/chat/${differentChatId}`,
        );
        expect(mockChatCacheSync.addChat).toHaveBeenCalledWith({
            chat: differentChat as any,
        });
    });
});

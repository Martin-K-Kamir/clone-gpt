import { beforeEach, describe, expect, it, vi } from "vitest";

import { INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import { getUserChatById } from "@/features/chat/services/api";

import { handleNewChatFinish } from "./handle-new-chat-finish";

vi.mock("@/features/chat/services/api", () => ({
    getUserChatById: vi.fn(),
}));

describe("handleNewChatFinish", () => {
    const chatId = "123e4567-e89b-12d3-a456-426614174000" as DBChatId;
    const mockChat: DBChat = {
        id: chatId,
        userId: "user-1" as any,
        title: "Test Chat",
        visibility: "private" as any,
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
        const differentChatId =
            "987fcdeb-51a2-43b4-c567-890123456789" as DBChatId;
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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type {
    DBChat,
    DBChatId,
    DBChatVisibility,
} from "@/features/chat/lib/types";
import {
    createChatsCacheUpdater,
    getChatIdFromPathname,
} from "@/features/chat/lib/utils";
import { useChatOffsetContext } from "@/features/chat/providers";

import { tag } from "@/lib/cache-tag";
import { tabScope } from "@/lib/utils";

import { useBroadcastChannel } from "@/hooks";

import {
    ChatCacheSyncProvider,
    useChatCacheSyncContext,
} from "./chat-cache-sync-provider";

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("@/hooks", () => ({
    useBroadcastChannel: vi.fn(),
}));

vi.mock("@/features/chat/providers", () => ({
    useChatOffsetContext: vi.fn(),
}));

vi.mock("@/features/chat/lib/utils", () => ({
    createChatsCacheUpdater: vi.fn(),
    getChatIdFromPathname: vi.fn(),
}));

vi.mock("@/lib/utils", async () => {
    const actual = await vi.importActual("@/lib/utils");
    return {
        ...actual,
        tabScope: vi.fn(),
    };
});

const mockUseRouter = vi.mocked(useRouter);
const mockUseBroadcastChannel = vi.mocked(useBroadcastChannel);
const mockUseChatOffsetContext = vi.mocked(useChatOffsetContext);
const mockCreateChatsCacheUpdater = vi.mocked(createChatsCacheUpdater);
const mockGetChatIdFromPathname = vi.mocked(getChatIdFromPathname);
const mockTabScope = vi.mocked(tabScope);

describe("ChatCacheSyncProvider", () => {
    let queryClient: QueryClient;
    let mockPostMessage: (message: unknown) => void;
    let mockRouterReplace: ReturnType<typeof vi.fn>;
    let mockIncrementOffset: ReturnType<typeof vi.fn>;
    let mockDecrementOffset: ReturnType<typeof vi.fn>;
    let mockResetOffset: ReturnType<typeof vi.fn>;
    let mockSetOffset: ReturnType<typeof vi.fn>;
    let chatsCacheUpdater: {
        addToUserChats: ReturnType<typeof vi.fn>;
        updateUserChat: ReturnType<typeof vi.fn>;
        updateUserChats: ReturnType<typeof vi.fn>;
        removeFromUserChats: ReturnType<typeof vi.fn>;
        clearUserChats: ReturnType<typeof vi.fn>;
        updateChatVisibility: ReturnType<typeof vi.fn>;
        updateChatTitle: ReturnType<typeof vi.fn>;
        addToInitialUserChatsSearch: ReturnType<typeof vi.fn>;
        updateInitialUserChatsSearch: ReturnType<typeof vi.fn>;
        upsertInitialUserChatsSearch: ReturnType<typeof vi.fn>;
        updateInitialUserChatsSearchTitle: ReturnType<typeof vi.fn>;
        clearInitialUserChatsSearch: ReturnType<typeof vi.fn>;
        removeFromUserSharedChats: ReturnType<typeof vi.fn>;
        removeAllUserSharedChats: ReturnType<typeof vi.fn>;
        revertLastChatsUpdate: ReturnType<typeof vi.fn>;
        revertLastChatUpdate: ReturnType<typeof vi.fn>;
        revertLastSharedChatsUpdate: ReturnType<typeof vi.fn>;
    };

    const createWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <ChatCacheSyncProvider>{children}</ChatCacheSyncProvider>
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        mockRouterReplace = vi.fn();
        mockIncrementOffset = vi.fn();
        mockDecrementOffset = vi.fn();
        mockResetOffset = vi.fn();
        mockSetOffset = vi.fn();
        mockPostMessage = vi.fn() as (message: unknown) => void;

        chatsCacheUpdater = {
            addToUserChats: vi.fn(),
            updateUserChat: vi.fn(),
            updateUserChats: vi.fn(),
            removeFromUserChats: vi.fn(),
            clearUserChats: vi.fn(),
            updateChatVisibility: vi.fn(),
            updateChatTitle: vi.fn(),
            addToInitialUserChatsSearch: vi.fn(),
            updateInitialUserChatsSearch: vi.fn(),
            upsertInitialUserChatsSearch: vi.fn(),
            updateInitialUserChatsSearchTitle: vi.fn(),
            clearInitialUserChatsSearch: vi.fn(),
            removeFromUserSharedChats: vi.fn(),
            removeAllUserSharedChats: vi.fn(),
            revertLastChatsUpdate: vi.fn(),
            revertLastChatUpdate: vi.fn(),
            revertLastSharedChatsUpdate: vi.fn(),
        };

        mockUseRouter.mockReturnValue({
            replace: mockRouterReplace,
        } as any);

        mockUseChatOffsetContext.mockReturnValue({
            prevClientOffset: 0,
            incrementOffset: mockIncrementOffset,
            decrementOffset: mockDecrementOffset,
            resetOffset: mockResetOffset,
            setOffset: mockSetOffset,
        } as any);

        mockCreateChatsCacheUpdater.mockReturnValue(chatsCacheUpdater as any);

        mockUseBroadcastChannel.mockReturnValue({
            postMessage: mockPostMessage,
            isConnected: true,
        });

        mockTabScope.mockImplementation((scope, handlers) => {
            if (
                scope === "thisTab" ||
                scope === "both" ||
                scope === undefined
            ) {
                handlers.thisTab?.();
            }
            if (scope === "otherTabs" || scope === "both") {
                handlers.otherTabs?.();
            }
        });

        mockGetChatIdFromPathname.mockReturnValue(null);
        Object.defineProperty(window, "location", {
            value: { pathname: "/" },
            writable: true,
        });
    });

    it("should provide all cache sync functions", () => {
        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        expect(typeof result.current.addChat).toBe("function");
        expect(typeof result.current.updateChat).toBe("function");
        expect(typeof result.current.updateChats).toBe("function");
        expect(typeof result.current.removeChat).toBe("function");
        expect(typeof result.current.clearChats).toBe("function");
        expect(typeof result.current.updateChatVisibility).toBe("function");
        expect(typeof result.current.updateChatTitle).toBe("function");
        expect(typeof result.current.invalidateSharedChats).toBe("function");
        expect(typeof result.current.invalidateInitialUserChatsSearch).toBe(
            "function",
        );
        expect(typeof result.current.addToInitialUserChatsSearch).toBe(
            "function",
        );
        expect(typeof result.current.updateInitialUserChatsSearch).toBe(
            "function",
        );
        expect(typeof result.current.upsertInitialUserChatsSearch).toBe(
            "function",
        );
        expect(typeof result.current.updateInitialUserChatsSearchTitle).toBe(
            "function",
        );
        expect(typeof result.current.clearInitialUserChatsSearch).toBe(
            "function",
        );
        expect(typeof result.current.removeFromSharedChats).toBe("function");
        expect(typeof result.current.removeAllSharedChats).toBe("function");
    });

    it("should add chat and return revert function", () => {
        const chat: DBChat = {
            id: "chat-1" as DBChatId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
        } as any;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.addChat({ chat });

        expect(mockIncrementOffset).toHaveBeenCalled();
        expect(chatsCacheUpdater.addToUserChats).toHaveBeenCalledWith({ chat });
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(mockDecrementOffset).toHaveBeenCalled();
        expect(chatsCacheUpdater.revertLastChatsUpdate).toHaveBeenCalled();
    });

    it("should update chat and return revert function", () => {
        const chatId = "chat-1" as DBChatId;
        const chat = { title: "Updated Title" };

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.updateChat({ chatId, chat });

        expect(chatsCacheUpdater.updateUserChat).toHaveBeenCalledWith({
            chatId,
            chat,
        });
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(chatsCacheUpdater.revertLastChatUpdate).toHaveBeenCalled();
    });

    it("should remove chat and return revert function", () => {
        const chatId = "chat-1" as DBChatId;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.removeChat({ chatId });

        expect(mockDecrementOffset).toHaveBeenCalled();
        expect(chatsCacheUpdater.removeFromUserChats).toHaveBeenCalledWith({
            chatId,
        });
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(mockIncrementOffset).toHaveBeenCalled();
        expect(chatsCacheUpdater.revertLastChatsUpdate).toHaveBeenCalled();
    });

    it("should redirect to home when removing current chat via broadcast message", () => {
        let capturedOnMessage: ((message: unknown) => void) | undefined;
        const chatId = "chat-1" as DBChatId;

        mockUseBroadcastChannel.mockImplementation((options: any) => {
            capturedOnMessage = options.onMessage;
            return {
                postMessage: mockPostMessage,
                isConnected: true,
            };
        });

        mockGetChatIdFromPathname.mockReturnValue(chatId);
        Object.defineProperty(window, "location", {
            value: { pathname: `/chat/${chatId}` },
            writable: true,
        });

        renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            capturedOnMessage?.({
                type: "removeFromUserChats",
                data: { chatId },
            });
        });

        expect(mockRouterReplace).toHaveBeenCalledWith("/");
    });

    it("should clear chats and return revert function", () => {
        mockUseChatOffsetContext.mockReturnValue({
            prevClientOffset: 5,
            incrementOffset: mockIncrementOffset,
            decrementOffset: mockDecrementOffset,
            resetOffset: mockResetOffset,
            setOffset: mockSetOffset,
        } as any);

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.clearChats();

        expect(mockSetOffset).toHaveBeenCalledWith(5);
        expect(chatsCacheUpdater.clearUserChats).toHaveBeenCalled();
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(mockSetOffset).toHaveBeenCalledWith(5);
        expect(chatsCacheUpdater.revertLastChatsUpdate).toHaveBeenCalled();
    });

    it("should redirect to home when clearing chats and current chat exists via broadcast message", () => {
        let capturedOnMessage: ((message: unknown) => void) | undefined;
        const chatId = "chat-1" as DBChatId;

        mockUseBroadcastChannel.mockImplementation((options: any) => {
            capturedOnMessage = options.onMessage;
            return {
                postMessage: mockPostMessage,
                isConnected: true,
            };
        });

        mockGetChatIdFromPathname.mockReturnValue(chatId);
        Object.defineProperty(window, "location", {
            value: { pathname: `/chat/${chatId}` },
            writable: true,
        });

        renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            capturedOnMessage?.({ type: "clearUserChats" });
        });

        expect(mockRouterReplace).toHaveBeenCalledWith("/");
    });

    it("should update chat visibility and return revert function", () => {
        const chatId = "chat-1" as DBChatId;
        const visibility: DBChatVisibility = CHAT_VISIBILITY.PUBLIC;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.updateChatVisibility({
            chatId,
            visibility,
        });

        expect(chatsCacheUpdater.updateChatVisibility).toHaveBeenCalledWith({
            chatId,
            visibility,
        });
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(chatsCacheUpdater.revertLastChatUpdate).toHaveBeenCalled();
    });

    it("should update chat title and return revert function", () => {
        const chatId = "chat-1" as DBChatId;
        const newTitle = "New Title";

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.updateChatTitle({ chatId, newTitle });

        expect(chatsCacheUpdater.updateChatTitle).toHaveBeenCalledWith({
            chatId,
            newTitle,
        });
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(chatsCacheUpdater.revertLastChatUpdate).toHaveBeenCalled();
    });

    it("should invalidate shared chats", () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.invalidateSharedChats();

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: [tag.userSharedChats()],
        });
    });

    it("should invalidate initial user chats search", () => {
        const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.invalidateInitialUserChatsSearch();

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: [tag.userInitialChatsSearch()],
        });
    });

    it("should add to initial user chats search", () => {
        const chat: DBChat = {
            id: "chat-1" as DBChatId,
            title: "Test",
        } as any;
        const limit = 10;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.addToInitialUserChatsSearch({ chat, limit });

        expect(
            chatsCacheUpdater.addToInitialUserChatsSearch,
        ).toHaveBeenCalledWith({ chat, limit });
    });

    it("should update initial user chats search", () => {
        const chatId = "chat-1" as DBChatId;
        const updater = vi.fn();

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.updateInitialUserChatsSearch({ chatId, updater });

        expect(
            chatsCacheUpdater.updateInitialUserChatsSearch,
        ).toHaveBeenCalledWith({ chatId, updater });
    });

    it("should upsert initial user chats search and return revert function", () => {
        const chatId = "chat-1" as DBChatId;
        const chat: DBChat = {
            id: chatId,
            title: "Test",
        } as any;
        const limit = 10;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.upsertInitialUserChatsSearch({
            chatId,
            chat,
            limit,
        });

        expect(
            chatsCacheUpdater.upsertInitialUserChatsSearch,
        ).toHaveBeenCalledWith({ chatId, chat, limit });
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(chatsCacheUpdater.revertLastChatsUpdate).toHaveBeenCalled();
    });

    it("should update initial user chats search title", () => {
        const chatId = "chat-1" as DBChatId;
        const newTitle = "New Title";

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.updateInitialUserChatsSearchTitle({
            chatId,
            newTitle,
        });

        expect(
            chatsCacheUpdater.updateInitialUserChatsSearchTitle,
        ).toHaveBeenCalledWith({ chatId, newTitle });
    });

    it("should clear initial user chats search", () => {
        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.clearInitialUserChatsSearch();

        expect(
            chatsCacheUpdater.clearInitialUserChatsSearch,
        ).toHaveBeenCalled();
    });

    it("should remove from shared chats", () => {
        const chatId = "chat-1" as DBChatId;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.removeFromSharedChats({ chatId });

        expect(
            chatsCacheUpdater.removeFromUserSharedChats,
        ).toHaveBeenCalledWith({ chatId });
    });

    it("should remove all shared chats and return revert function", () => {
        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const revert = result.current.removeAllSharedChats();

        expect(chatsCacheUpdater.removeAllUserSharedChats).toHaveBeenCalled();
        expect(typeof revert).toBe("function");

        act(() => {
            revert();
        });

        expect(
            chatsCacheUpdater.revertLastSharedChatsUpdate,
        ).toHaveBeenCalled();
    });

    it("should post message to other tabs when scope is otherTabs", () => {
        const chat: DBChat = {
            id: "chat-1" as DBChatId,
            title: "Test",
        } as any;

        const { result } = renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        result.current.addChat({ chat, scope: "otherTabs" });

        expect(mockPostMessage).toHaveBeenCalledWith({
            type: "addToUserChats",
            data: chat,
        });
        expect(mockIncrementOffset).not.toHaveBeenCalled();
        expect(chatsCacheUpdater.addToUserChats).not.toHaveBeenCalled();
    });

    it("should handle broadcast messages for addToUserChats", () => {
        let capturedOnMessage: ((message: unknown) => void) | undefined;

        mockUseBroadcastChannel.mockImplementation((options: any) => {
            capturedOnMessage = options.onMessage;
            return {
                postMessage: mockPostMessage,
                isConnected: true,
            };
        });

        renderHook(() => useChatCacheSyncContext(), {
            wrapper: createWrapper,
        });

        const chat: DBChat = {
            id: "chat-1" as DBChatId,
            title: "Test",
        } as any;

        act(() => {
            capturedOnMessage?.({ type: "addToUserChats", data: chat });
        });

        expect(mockIncrementOffset).toHaveBeenCalled();
        expect(chatsCacheUpdater.addToUserChats).toHaveBeenCalledWith({
            chat,
        });
    });
});

describe("useChatCacheSyncContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatCacheSyncContext());
        }).toThrow(
            "useChatCacheSyncContext must be used within a ChatCacheSyncProvider",
        );
    });
});

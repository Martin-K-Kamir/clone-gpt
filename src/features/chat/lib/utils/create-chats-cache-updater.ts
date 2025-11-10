import { QueryClient } from "@tanstack/react-query";

import type {
    DBChat,
    WithChat,
    WithChatId,
    WithChatUpdate,
    WithVisibility,
} from "@/features/chat/lib/types";

import { tag } from "@/lib/cache-tags";
import { PaginatedData, WithNewTitle } from "@/lib/types";
import { createCacheUpdater, createInfiniteCacheUpdater } from "@/lib/utils";

export function createChatsCacheUpdater(queryClient: QueryClient) {
    let previousSharedChatsState: Array<
        [[string, number, number], PaginatedData<DBChat[]>]
    > | null = null;

    const infiniteChatsUpdater = createInfiniteCacheUpdater<DBChat>(
        queryClient,
        [tag.userChats()],
    );
    const singleChatUpdater = createCacheUpdater<DBChat>(queryClient);

    function addToUserChats({ chat }: WithChat) {
        infiniteChatsUpdater.add(chat);
    }

    function updateUserChat({ chatId, chat }: WithChatId & WithChatUpdate) {
        singleChatUpdater.update([tag.userChat(chatId)], (old: DBChat) => ({
            ...old,
            ...chat,
        }));
    }

    function updateUserChats({ chatId, chat }: WithChatId & WithChatUpdate) {
        infiniteChatsUpdater.update(chatId, (old: DBChat) => ({
            ...old,
            ...chat,
        }));
    }

    function removeFromUserChats({ chatId }: WithChatId) {
        infiniteChatsUpdater.remove(chatId);
    }

    function clearUserChats() {
        infiniteChatsUpdater.clear();
    }

    function updateChatVisibility({
        chatId,
        visibility,
    }: WithChatId & WithVisibility) {
        singleChatUpdater.update([tag.userChat(chatId)], (old: DBChat) => ({
            ...old,
            visibility,
        }));
    }

    function updateChatTitle({ chatId, newTitle }: WithChatId & WithNewTitle) {
        singleChatUpdater.update([tag.userChat(chatId)], (old: DBChat) => ({
            ...old,
            title: newTitle,
        }));
    }

    function removeFromUserSharedChats({ chatId }: WithChatId) {
        const queries = queryClient.getQueriesData({
            queryKey: [tag.userSharedChats()],
        }) as [[string, number, number], PaginatedData<DBChat[]>][];

        const joinedQueriesData = queries
            .flatMap(([, data]) => {
                return data.data;
            })
            .filter(chat => chat.id !== chatId);

        queries.forEach(([queryKey, originalData], pageIndex) => {
            const [, , limit] = queryKey;

            const startIndex = pageIndex * limit;
            const endIndex = startIndex + limit;
            const newData = joinedQueriesData.slice(startIndex, endIndex);
            const newTotalCount = originalData.totalCount - 1;
            const totalPages = Math.ceil(newTotalCount / limit);

            queryClient.setQueryData(queryKey, {
                ...originalData,
                data: newData,
                totalCount: newTotalCount,
                hasNextPage: pageIndex < totalPages - 1,
                nextOffset:
                    pageIndex < totalPages - 1
                        ? (pageIndex + 1) * limit
                        : undefined,
            });
        });
    }

    function removeAllUserSharedChats() {
        const queries = queryClient.getQueriesData({
            queryKey: [tag.userSharedChats()],
        });

        previousSharedChatsState = queries.map(([queryKey, data]) => [
            queryKey as [string, number, number],
            data as PaginatedData<DBChat[]>,
        ]);

        queries.forEach(([queryKey]) => {
            queryClient.setQueryData(
                queryKey,
                (prev: PaginatedData<DBChat[]> | undefined) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        data: [],
                        totalCount: 0,
                        hasNextPage: false,
                        nextOffset: undefined,
                    };
                },
            );
        });
    }

    function addToInitialUserChatsSearch({
        chat,
        limit = Number.MAX_SAFE_INTEGER,
    }: WithChat & { limit?: number }) {
        queryClient.setQueryData(
            [tag.userInitialChatsSearch()],
            (old: DBChat[]) => {
                if (!old) return old;
                return [chat, ...old].slice(0, limit);
            },
        );
    }

    function updateInitialUserChatsSearch({
        chatId,
        updater,
    }: WithChatId & { updater: (chat: DBChat) => DBChat }) {
        queryClient.setQueryData(
            [tag.userInitialChatsSearch()],
            (old: DBChat[]) =>
                old.map(chat => (chat.id === chatId ? updater(chat) : chat)),
        );
    }

    function upsertInitialUserChatsSearch({
        chatId,
        chat,
        limit = Number.MAX_SAFE_INTEGER,
    }: WithChatId & WithChat & { limit?: number }) {
        queryClient.setQueryData(
            [tag.userInitialChatsSearch()],
            (old: DBChat[]) => {
                if (!old) return [chat];

                const existingIndex = old.findIndex(c => c.id === chatId);

                if (existingIndex !== -1) {
                    const updated = [...old];
                    updated[existingIndex] = chat;
                    return updated.slice(0, limit);
                } else {
                    return [chat, ...old].slice(0, limit);
                }
            },
        );
    }

    function updateInitialUserChatsSearchTitle({
        chatId,
        newTitle,
    }: WithChatId & WithNewTitle) {
        queryClient.setQueryData(
            [tag.userInitialChatsSearch()],
            (old: DBChat[]) =>
                old.map(chat =>
                    chat.id === chatId ? { ...chat, title: newTitle } : chat,
                ),
        );
    }

    function clearInitialUserChatsSearch() {
        queryClient.setQueryData([tag.userInitialChatsSearch()], []);
    }

    function revertLastChatsUpdate() {
        infiniteChatsUpdater.revert();
    }

    function revertLastChatUpdate() {
        singleChatUpdater.revert();
    }

    function revertLastSharedChatsUpdate() {
        if (!previousSharedChatsState) {
            return;
        }

        previousSharedChatsState.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
        });
        previousSharedChatsState = null;
    }

    return {
        addToUserChats,
        updateUserChat,
        updateUserChats,
        removeFromUserChats,
        clearUserChats,
        updateChatVisibility,
        updateChatTitle,
        removeFromUserSharedChats,
        removeAllUserSharedChats,
        addToInitialUserChatsSearch,
        upsertInitialUserChatsSearch,
        updateInitialUserChatsSearch,
        updateInitialUserChatsSearchTitle,
        clearInitialUserChatsSearch,
        revertLastChatsUpdate,
        revertLastChatUpdate,
        revertLastSharedChatsUpdate,
    };
}

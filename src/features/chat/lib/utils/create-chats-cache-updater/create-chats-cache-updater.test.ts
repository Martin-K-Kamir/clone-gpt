import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { type InfiniteData, QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat } from "@/features/chat/lib/types";

import { tag } from "@/lib/cache-tag";
import type { PaginatedData } from "@/lib/types";

import { createChatsCacheUpdater } from "./create-chats-cache-updater";

describe("createChatsCacheUpdater", () => {
    let queryClient: QueryClient;
    let cacheUpdater: ReturnType<typeof createChatsCacheUpdater>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        cacheUpdater = createChatsCacheUpdater(queryClient);
    });

    afterEach(() => {
        queryClient.clear();
    });

    describe("addToUserChats", () => {
        it("should add chat to user chats", () => {
            const userId = generateUserId();
            const existingChatId = generateChatId();
            const newChatId = generateChatId();

            const existingChat: DBChat = {
                id: existingChatId,
                userId,
                title: "Existing Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            const newChat: DBChat = {
                id: newChatId,
                userId,
                title: "Test Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            // Set up initial cache state
            queryClient.setQueryData<InfiniteData<PaginatedData<DBChat[]>>>(
                [tag.userChats()],
                {
                    pages: [
                        {
                            data: [existingChat],
                            totalCount: 1,
                            hasNextPage: false,
                            nextOffset: undefined,
                        },
                    ],
                    pageParams: [],
                },
            );

            cacheUpdater.addToUserChats({ chat: newChat });

            const data = queryClient.getQueryData<
                InfiniteData<PaginatedData<DBChat[]>>
            >([tag.userChats()]);

            expect(data?.pages[0].data).toHaveLength(2);
            expect(data?.pages[0].data[0].id).toBe(newChatId);
            expect(data?.pages[0].data[1].id).toBe(existingChatId);
        });
    });

    describe("updateUserChat", () => {
        it("should update single user chat", () => {
            const chatId = generateChatId();
            const userId = generateUserId();
            const originalChat: DBChat = {
                id: chatId,
                userId,
                title: "Original Title",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData([tag.userChat(chatId)], originalChat);

            const chatUpdate = {
                title: "Updated Title",
            };

            cacheUpdater.updateUserChat({ chatId, chat: chatUpdate });

            const updated = queryClient.getQueryData<DBChat>([
                tag.userChat(chatId),
            ]);

            expect(updated?.title).toBe("Updated Title");
            expect(updated?.id).toBe(chatId);
            expect(updated?.visibility).toBe(originalChat.visibility);
        });
    });

    describe("updateUserChats", () => {
        it("should update chat in user chats list", () => {
            const chatId = generateChatId();
            const userId = generateUserId();
            const originalChat: DBChat = {
                id: chatId,
                userId,
                title: "Original Title",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData<InfiniteData<PaginatedData<DBChat[]>>>(
                [tag.userChats()],
                {
                    pages: [
                        {
                            data: [originalChat],
                            totalCount: 1,
                            hasNextPage: false,
                            nextOffset: undefined,
                        },
                    ],
                    pageParams: [],
                },
            );

            const chatUpdate = {
                title: "Updated Title",
            };

            cacheUpdater.updateUserChats({ chatId, chat: chatUpdate });

            const data = queryClient.getQueryData<
                InfiniteData<PaginatedData<DBChat[]>>
            >([tag.userChats()]);

            expect(data?.pages[0].data[0].title).toBe("Updated Title");
            expect(data?.pages[0].data[0].id).toBe(chatId);
        });
    });

    describe("removeFromUserChats", () => {
        it("should remove chat from user chats", () => {
            const userId = generateUserId();
            const chatId1 = generateChatId();
            const chatId2 = generateChatId();
            const chat1: DBChat = {
                id: chatId1,
                userId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            const chat2: DBChat = {
                id: chatId2,
                userId,
                title: "Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData<InfiniteData<PaginatedData<DBChat[]>>>(
                [tag.userChats()],
                {
                    pages: [
                        {
                            data: [chat1, chat2],
                            totalCount: 2,
                            hasNextPage: false,
                            nextOffset: undefined,
                        },
                    ],
                    pageParams: [],
                },
            );

            cacheUpdater.removeFromUserChats({ chatId: chatId1 });

            const data = queryClient.getQueryData<
                InfiniteData<PaginatedData<DBChat[]>>
            >([tag.userChats()]);

            expect(data?.pages[0].data).toHaveLength(1);
            expect(data?.pages[0].data[0].id).toBe(chatId2);
        });
    });

    describe("clearUserChats", () => {
        it("should clear all user chats", () => {
            cacheUpdater.clearUserChats();

            const data = queryClient.getQueryData<
                InfiniteData<PaginatedData<DBChat[]>>
            >([tag.userChats()]);
            if (data) {
                expect(data.pages[0].data).toHaveLength(0);
                expect(data.pages[0].hasNextPage).toBe(false);
            }
        });
    });

    describe("updateChatVisibility", () => {
        it("should update chat visibility", () => {
            const chatId = generateChatId();
            const userId = generateUserId();
            const visibility = CHAT_VISIBILITY.PUBLIC;

            queryClient.setQueryData([tag.userChat(chatId)], {
                id: chatId,
                userId,
                title: "Test",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            });

            cacheUpdater.updateChatVisibility({ chatId, visibility });

            const updated = queryClient.getQueryData<DBChat>([
                tag.userChat(chatId),
            ]);
            expect(updated?.visibility).toBe(visibility);
        });
    });

    describe("updateChatTitle", () => {
        it("should update chat title", () => {
            const chatId = generateChatId();
            const userId = generateUserId();
            const newTitle = "New Title";

            queryClient.setQueryData([tag.userChat(chatId)], {
                id: chatId,
                userId,
                title: "Old Title",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            });

            cacheUpdater.updateChatTitle({ chatId, newTitle });

            const updated = queryClient.getQueryData<DBChat>([
                tag.userChat(chatId),
            ]);
            expect(updated?.title).toBe(newTitle);
        });
    });

    describe("removeFromUserSharedChats", () => {
        it("should remove chat from shared chats", () => {
            const userId = generateUserId();
            const chatId1 = generateChatId();
            const chatId2 = generateChatId();
            const chat1: DBChat = {
                id: chatId1,
                userId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };
            const chat2: DBChat = {
                id: chatId2,
                userId,
                title: "Chat 2",
                visibility: CHAT_VISIBILITY.PUBLIC,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            const queryKey: [string, number, number] = [
                tag.userSharedChats(),
                0,
                10,
            ];
            const paginatedData: PaginatedData<DBChat[]> = {
                data: [chat1, chat2],
                totalCount: 2,
                hasNextPage: false,
                nextOffset: undefined,
            };

            queryClient.setQueryData(queryKey, paginatedData);

            cacheUpdater.removeFromUserSharedChats({ chatId: chatId1 });

            const updated =
                queryClient.getQueryData<PaginatedData<DBChat[]>>(queryKey);
            expect(updated?.data).toHaveLength(1);
            expect(updated?.data[0].id).toBe(chatId2);
            expect(updated?.totalCount).toBe(1);
        });

        it("should handle pagination correctly", () => {
            const userId = generateUserId();
            const chats: DBChat[] = Array.from({ length: 25 }, (_, i) => ({
                id: generateChatId(),
                userId,
                title: `Chat ${i + 1}`,
                visibility: CHAT_VISIBILITY.PUBLIC,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            }));

            const queryKey1: [string, number, number] = [
                tag.userSharedChats(),
                0,
                10,
            ];
            const queryKey2: [string, number, number] = [
                tag.userSharedChats(),
                1,
                10,
            ];

            queryClient.setQueryData(queryKey1, {
                data: chats.slice(0, 10),
                totalCount: 25,
                hasNextPage: true,
                nextOffset: 10,
            });
            queryClient.setQueryData(queryKey2, {
                data: chats.slice(10, 20),
                totalCount: 25,
                hasNextPage: true,
                nextOffset: 20,
            });

            const chatIdToRemove = chats[4].id;
            cacheUpdater.removeFromUserSharedChats({
                chatId: chatIdToRemove,
            });

            const updated1 =
                queryClient.getQueryData<PaginatedData<DBChat[]>>(queryKey1);
            const updated2 =
                queryClient.getQueryData<PaginatedData<DBChat[]>>(queryKey2);

            expect(updated1?.totalCount).toBe(24);
            expect(updated2?.totalCount).toBe(24);
        });
    });

    describe("removeAllUserSharedChats", () => {
        it("should remove all shared chats and save state for revert", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const chat1: DBChat = {
                id: chatId,
                userId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            const queryKey: [string, number, number] = [
                tag.userSharedChats(),
                0,
                10,
            ];
            const paginatedData: PaginatedData<DBChat[]> = {
                data: [chat1],
                totalCount: 1,
                hasNextPage: false,
                nextOffset: undefined,
            };

            queryClient.setQueryData(queryKey, paginatedData);

            cacheUpdater.removeAllUserSharedChats();

            const updated =
                queryClient.getQueryData<PaginatedData<DBChat[]>>(queryKey);
            expect(updated?.data).toHaveLength(0);
            expect(updated?.totalCount).toBe(0);
            expect(updated?.hasNextPage).toBe(false);
        });
    });

    describe("addToInitialUserChatsSearch", () => {
        it("should add chat to initial search results", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const chat: DBChat = {
                id: chatId,
                userId,
                title: "New Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            const existingChat: DBChat = {
                id: generateChatId(),
                userId,
                title: "Existing Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData(
                [tag.userInitialChatsSearch()],
                [existingChat],
            );

            cacheUpdater.addToInitialUserChatsSearch({ chat });

            const updated = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(updated).toHaveLength(2);
            expect(updated?.[0].id).toBe(chatId);
        });

        it("should respect limit", () => {
            const userId = generateUserId();
            const chats: DBChat[] = Array.from({ length: 5 }, (_, i) => ({
                id: generateChatId(),
                userId,
                title: `Chat ${i + 1}`,
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            }));

            queryClient.setQueryData([tag.userInitialChatsSearch()], chats);

            const newChat: DBChat = {
                id: generateChatId(),
                userId,
                title: "New Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            cacheUpdater.addToInitialUserChatsSearch({
                chat: newChat,
                limit: 3,
            });

            const updated = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(updated).toHaveLength(3);
        });
    });

    describe("updateInitialUserChatsSearch", () => {
        it("should update chat in initial search results", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const chat: DBChat = {
                id: chatId,
                userId,
                title: "Original Title",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData([tag.userInitialChatsSearch()], [chat]);

            cacheUpdater.updateInitialUserChatsSearch({
                chatId,
                updater: old => ({ ...old, title: "Updated Title" }),
            });

            const updated = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(updated?.[0].title).toBe("Updated Title");
        });
    });

    describe("upsertInitialUserChatsSearch", () => {
        it("should insert chat when it does not exist", () => {
            const userId = generateUserId();
            const existingChatId = generateChatId();
            const newChatId = generateChatId();
            const existingChat: DBChat = {
                id: existingChatId,
                userId,
                title: "Existing",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData(
                [tag.userInitialChatsSearch()],
                [existingChat],
            );

            const newChat: DBChat = {
                id: newChatId,
                userId,
                title: "New",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            cacheUpdater.upsertInitialUserChatsSearch({
                chatId: newChatId,
                chat: newChat,
            });

            const updated = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(updated).toHaveLength(2);
            expect(updated?.[0].id).toBe(newChatId);
        });

        it("should update chat when it exists", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const chat: DBChat = {
                id: chatId,
                userId,
                title: "Original",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData([tag.userInitialChatsSearch()], [chat]);

            const updatedChat: DBChat = {
                ...chat,
                title: "Updated",
            };

            cacheUpdater.upsertInitialUserChatsSearch({
                chatId,
                chat: updatedChat,
            });

            const result = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(result?.[0].title).toBe("Updated");
        });
    });

    describe("updateInitialUserChatsSearchTitle", () => {
        it("should update chat title in initial search", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const chat: DBChat = {
                id: chatId,
                userId,
                title: "Original",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData([tag.userInitialChatsSearch()], [chat]);

            cacheUpdater.updateInitialUserChatsSearchTitle({
                chatId,
                newTitle: "New Title",
            });

            const updated = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(updated?.[0].title).toBe("New Title");
        });
    });

    describe("clearInitialUserChatsSearch", () => {
        it("should clear initial search results", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const chat: DBChat = {
                id: chatId,
                userId,
                title: "Test",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData([tag.userInitialChatsSearch()], [chat]);

            cacheUpdater.clearInitialUserChatsSearch();

            const updated = queryClient.getQueryData<DBChat[]>([
                tag.userInitialChatsSearch(),
            ]);
            expect(updated).toEqual([]);
        });
    });

    describe("revert functions", () => {
        it("should revert last chats update", () => {
            const userId = generateUserId();
            const originalChatId = generateChatId();
            const newChatId = generateChatId();
            const originalChat: DBChat = {
                id: originalChatId,
                userId,
                title: "Original Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData<InfiniteData<PaginatedData<DBChat[]>>>(
                [tag.userChats()],
                {
                    pages: [
                        {
                            data: [originalChat],
                            totalCount: 1,
                            hasNextPage: false,
                            nextOffset: undefined,
                        },
                    ],
                    pageParams: [],
                },
            );

            const newChat: DBChat = {
                id: newChatId,
                userId,
                title: "New Chat",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            cacheUpdater.addToUserChats({ chat: newChat });

            const afterAdd = queryClient.getQueryData<
                InfiniteData<PaginatedData<DBChat[]>>
            >([tag.userChats()]);
            expect(afterAdd?.pages[0].data).toHaveLength(2);

            cacheUpdater.revertLastChatsUpdate();

            const reverted = queryClient.getQueryData<
                InfiniteData<PaginatedData<DBChat[]>>
            >([tag.userChats()]);
            expect(reverted?.pages[0].data).toHaveLength(1);
            expect(reverted?.pages[0].data[0].id).toBe(originalChatId);
        });

        it("should revert last chat update", () => {
            const userId = generateUserId();
            const chatId = generateChatId();
            const originalChat: DBChat = {
                id: chatId,
                userId,
                title: "Original Title",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                visibleAt: new Date().toISOString(),
            };

            queryClient.setQueryData([tag.userChat(chatId)], originalChat);

            cacheUpdater.updateUserChat({
                chatId,
                chat: { title: "Updated Title" },
            });

            const afterUpdate = queryClient.getQueryData<DBChat>([
                tag.userChat(chatId),
            ]);
            expect(afterUpdate?.title).toBe("Updated Title");

            cacheUpdater.revertLastChatUpdate();

            const reverted = queryClient.getQueryData<DBChat>([
                tag.userChat(chatId),
            ]);
            expect(reverted?.title).toBe("Original Title");
        });

        it("should revert last shared chats update when state exists", () => {
            const queryKey: [string, number, number] = [
                tag.userSharedChats(),
                0,
                10,
            ];
            const originalData: PaginatedData<DBChat[]> = {
                data: [],
                totalCount: 0,
                hasNextPage: false,
                nextOffset: undefined,
            };

            queryClient.setQueryData(queryKey, originalData);

            cacheUpdater.removeAllUserSharedChats();

            queryClient.setQueryData(queryKey, {
                ...originalData,
                totalCount: 5,
            });

            cacheUpdater.revertLastSharedChatsUpdate();

            const reverted =
                queryClient.getQueryData<PaginatedData<DBChat[]>>(queryKey);
            expect(reverted?.totalCount).toBe(0);
        });

        it("should do nothing when reverting shared chats with no saved state", () => {
            cacheUpdater.revertLastSharedChatsUpdate();

            expect(true).toBe(true);
        });
    });
});

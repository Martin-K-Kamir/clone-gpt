"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { useCallback, useMemo } from "react";

import type {
    DBChat,
    WithChat,
    WithChatId,
    WithChatUpdate,
    WithVisibility,
} from "@/features/chat/lib/types";
import {
    createChatsCacheUpdater,
    getChatIdFromPathname,
} from "@/features/chat/lib/utils";
import { useChatOffsetContext } from "@/features/chat/providers";

import { tag } from "@/lib/cache-tags";
import type {
    RevertFn,
    SyncActionProps,
    SyncFn,
    WithNewTitle,
    WithOptionalLimit,
} from "@/lib/types";
import { tabScope } from "@/lib/utils";

import { useBroadcastChannel } from "@/hooks";

type AddChatAction = {
    type: "addToUserChats";
    data: DBChat;
};

type UpdateChatAction = {
    type: "updateUserChat";
    data: WithChatId & WithChatUpdate;
};

type UpdateChatsAction = {
    type: "updateUserChats";
    data: WithChatId & WithChatUpdate;
};

type RemoveChatAction = {
    type: "removeFromUserChats";
    data: WithChatId;
};

type ClearChatsAction = {
    type: "clearUserChats";
};

type UpdateChatVisibilityAction = {
    type: "updateChatVisibility";
    data: WithChatId & WithVisibility;
};

type UpdateChatTitleAction = {
    type: "updateChatTitle";
    data: WithChatId & WithNewTitle;
};

type InvalidateSharedChatsAction = {
    type: "invalidateSharedChats";
};

type InvalidateInitialUserChatsSearchAction = {
    type: "invalidateInitialUserChatsSearch";
};

type AddToInitialUserChatsSearchAction = {
    type: "addToInitialUserChatsSearch";
    data: WithChat & WithOptionalLimit;
};

type UpdateInitialUserChatsSearchAction = {
    type: "updateInitialUserChatsSearch";
    data: WithChatId & { updater: (chat: DBChat) => DBChat };
};

type UpsertInitialUserChatsSearchAction = {
    type: "upsertInitialUserChatsSearch";
    data: WithChatId & WithChat & WithOptionalLimit;
};

type UpdateInitialUserChatsSearchTitleAction = {
    type: "updateInitialUserChatsSearchTitle";
    data: WithChatId & WithNewTitle;
};

type ClearInitialUserChatsSearchAction = {
    type: "clearInitialUserChatsSearch";
};

type RemoveFromSharedChatsAction = {
    type: "removeFromSharedChats";
    data: WithChatId;
};

type RemoveAllSharedChatsAction = {
    type: "removeAllSharedChats";
};

type RevertLastChatsUpdateAction = {
    type: "revertLastChatsUpdate";
};

type RevertLastChatUpdateAction = {
    type: "revertLastChatUpdate";
};

type RevertLastSharedChatsUpdateAction = {
    type: "revertLastSharedChatsUpdate";
};

type ChatAction =
    | AddChatAction
    | UpdateChatAction
    | UpdateChatsAction
    | RemoveChatAction
    | ClearChatsAction
    | UpdateChatVisibilityAction
    | UpdateChatTitleAction
    | InvalidateInitialUserChatsSearchAction
    | InvalidateSharedChatsAction
    | AddToInitialUserChatsSearchAction
    | UpdateInitialUserChatsSearchAction
    | UpsertInitialUserChatsSearchAction
    | UpdateInitialUserChatsSearchTitleAction
    | ClearInitialUserChatsSearchAction
    | RemoveFromSharedChatsAction
    | RemoveAllSharedChatsAction
    | RevertLastChatsUpdateAction
    | RevertLastChatUpdateAction
    | RevertLastSharedChatsUpdateAction;

type AddChatProps = SyncActionProps<WithChat>;
type UpdateChatProps = SyncActionProps<WithChatId & WithChatUpdate>;
type UpdateChatsProps = SyncActionProps<WithChatId & WithChatUpdate>;
type RemoveChatProps = SyncActionProps<WithChatId>;
type ClearChatsProps = SyncActionProps;
type UpdateChatVisibilityProps = SyncActionProps<WithChatId & WithVisibility>;
type UpdateChatTitleProps = SyncActionProps<WithChatId & WithNewTitle>;
type InvalidateInitialUserChatsSearchProps = SyncActionProps;
type InvalidateSharedChatsProps = SyncActionProps;
type AddToInitialUserChatsSearchProps = SyncActionProps<
    WithChat & WithOptionalLimit
>;
type UpdateInitialUserChatsSearchProps = SyncActionProps<
    WithChatId & { updater: (chat: DBChat) => DBChat }
>;
type ClearInitialUserChatsSearchProps = SyncActionProps;
type UpsertInitialUserChatsSearchProps = SyncActionProps<
    WithChatId & WithChat & WithOptionalLimit
>;
type UpdateInitialUserChatsSearchTitleProps = SyncActionProps<
    WithChatId & WithNewTitle
>;
type RemoveFromSharedChatsProps = SyncActionProps<WithChatId>;
type RemoveAllSharedChatsProps = SyncActionProps;

type ChatCacheSyncContext = {
    addChat: SyncFn<AddChatProps, RevertFn>;
    updateChat: SyncFn<UpdateChatProps, RevertFn>;
    updateChats: SyncFn<UpdateChatsProps, RevertFn>;
    removeChat: SyncFn<RemoveChatProps, RevertFn>;
    clearChats: SyncFn<ClearChatsProps, RevertFn>;
    updateChatVisibility: SyncFn<UpdateChatVisibilityProps, RevertFn>;
    updateChatTitle: SyncFn<UpdateChatTitleProps, RevertFn>;
    invalidateInitialUserChatsSearch: SyncFn<InvalidateInitialUserChatsSearchProps>;
    invalidateSharedChats: SyncFn<InvalidateSharedChatsProps>;
    addToInitialUserChatsSearch: SyncFn<AddToInitialUserChatsSearchProps>;
    updateInitialUserChatsSearch: SyncFn<UpdateInitialUserChatsSearchProps>;
    upsertInitialUserChatsSearch: SyncFn<
        UpsertInitialUserChatsSearchProps,
        RevertFn
    >;
    updateInitialUserChatsSearchTitle: SyncFn<UpdateInitialUserChatsSearchTitleProps>;
    clearInitialUserChatsSearch: SyncFn<ClearInitialUserChatsSearchProps>;
    removeFromSharedChats: SyncFn<RemoveFromSharedChatsProps>;
    removeAllSharedChats: SyncFn<RemoveAllSharedChatsProps, RevertFn>;
};

export const ChatCacheSyncContext = createContext<ChatCacheSyncContext | null>(
    null,
);

export function ChatCacheSyncProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {
        prevClientOffset,
        incrementOffset,
        decrementOffset,
        resetOffset,
        setOffset,
    } = useChatOffsetContext();

    const chatsCacheUpdater = useMemo(
        () => createChatsCacheUpdater(queryClient),
        [queryClient],
    );

    const { postMessage } = useBroadcastChannel<ChatAction>({
        channelName: "chat-cache-sync",
        onMessage: useCallback(
            (message: ChatAction) => {
                if (message.type === "addToUserChats") {
                    incrementOffset();
                    chatsCacheUpdater.addToUserChats({ chat: message.data });
                    return;
                }

                if (message.type === "updateUserChat") {
                    chatsCacheUpdater.updateUserChat({
                        chatId: message.data.chatId,
                        chat: message.data.chat,
                    });
                    return;
                }

                if (message.type === "updateUserChats") {
                    chatsCacheUpdater.updateUserChats({
                        chatId: message.data.chatId,
                        chat: message.data.chat,
                    });
                    return;
                }

                if (message.type === "removeFromUserChats") {
                    decrementOffset();
                    chatsCacheUpdater.removeFromUserChats({
                        chatId: message.data.chatId,
                    });

                    const pathChatId = getChatIdFromPathname(location.pathname);
                    if (pathChatId && pathChatId === message.data.chatId) {
                        router.replace("/");
                    }
                    return;
                }

                if (message.type === "clearUserChats") {
                    resetOffset();
                    chatsCacheUpdater.clearUserChats();

                    const pathChatId = getChatIdFromPathname(location.pathname);
                    if (pathChatId) {
                        router.replace("/");
                    }
                    return;
                }

                if (message.type === "updateChatVisibility") {
                    chatsCacheUpdater.updateChatVisibility({
                        chatId: message.data.chatId,
                        visibility: message.data.visibility,
                    });
                    return;
                }

                if (message.type === "updateChatTitle") {
                    chatsCacheUpdater.updateChatTitle({
                        chatId: message.data.chatId,
                        newTitle: message.data.newTitle,
                    });
                    return;
                }

                if (message.type === "invalidateInitialUserChatsSearch") {
                    queryClient.invalidateQueries({
                        queryKey: [tag.userInitialChatsSearch()],
                    });
                    return;
                }

                if (message.type === "addToInitialUserChatsSearch") {
                    chatsCacheUpdater.addToInitialUserChatsSearch({
                        chat: message.data.chat,
                        limit: message.data.limit,
                    });
                    return;
                }

                if (message.type === "updateInitialUserChatsSearch") {
                    chatsCacheUpdater.updateInitialUserChatsSearch({
                        chatId: message.data.chatId,
                        updater: message.data.updater,
                    });
                    return;
                }

                if (message.type === "upsertInitialUserChatsSearch") {
                    chatsCacheUpdater.upsertInitialUserChatsSearch({
                        chatId: message.data.chatId,
                        chat: message.data.chat,
                        limit: message.data.limit,
                    });
                    return;
                }

                if (message.type === "updateInitialUserChatsSearchTitle") {
                    chatsCacheUpdater.updateInitialUserChatsSearchTitle({
                        chatId: message.data.chatId,
                        newTitle: message.data.newTitle,
                    });
                    return;
                }

                if (message.type === "clearInitialUserChatsSearch") {
                    chatsCacheUpdater.clearInitialUserChatsSearch();
                    return;
                }

                if (message.type === "invalidateSharedChats") {
                    queryClient.invalidateQueries({
                        queryKey: [tag.userSharedChats()],
                    });
                    return;
                }

                if (message.type === "removeFromSharedChats") {
                    chatsCacheUpdater.removeFromUserSharedChats({
                        chatId: message.data.chatId,
                    });
                    return;
                }

                if (message.type === "removeAllSharedChats") {
                    chatsCacheUpdater.removeAllUserSharedChats();
                    return;
                }

                if (message.type === "revertLastChatsUpdate") {
                    chatsCacheUpdater.revertLastChatsUpdate();
                    return;
                }

                if (message.type === "revertLastChatUpdate") {
                    chatsCacheUpdater.revertLastChatUpdate();
                    return;
                }

                if (message.type === "revertLastSharedChatsUpdate") {
                    chatsCacheUpdater.revertLastSharedChatsUpdate();
                    return;
                }

                const _exhaustiveCheck: never = message;
                throw new Error(`Exhaustive check failed: ${_exhaustiveCheck}`);
            },
            [
                incrementOffset,
                decrementOffset,
                resetOffset,
                chatsCacheUpdater,
                queryClient,
                router,
            ],
        ),
    });

    const addChat = useCallback(
        ({ chat, scope }: AddChatProps) => {
            tabScope(scope, {
                thisTab: () => {
                    incrementOffset();
                    chatsCacheUpdater.addToUserChats({ chat });
                },
                otherTabs: () => {
                    postMessage({ type: "addToUserChats", data: chat });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        decrementOffset();
                        chatsCacheUpdater.revertLastChatsUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatsUpdate" });
                    },
                });
        },
        [postMessage, incrementOffset, chatsCacheUpdater, decrementOffset],
    );

    const updateChat = useCallback(
        ({ chatId, chat, scope }: UpdateChatProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.updateUserChat({
                        chatId,
                        chat,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "updateUserChat",
                        data: { chatId, chat },
                    });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        chatsCacheUpdater.revertLastChatUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatUpdate" });
                    },
                });
        },
        [postMessage, chatsCacheUpdater],
    );

    const updateChats = useCallback(
        ({ chatId, chat, scope }: UpdateChatsProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.updateUserChats({
                        chatId,
                        chat,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "updateUserChats",
                        data: { chatId, chat },
                    });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        chatsCacheUpdater.revertLastChatsUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatsUpdate" });
                    },
                });
        },
        [postMessage, chatsCacheUpdater],
    );

    const removeChat = useCallback(
        ({ chatId, scope }: RemoveChatProps) => {
            tabScope(scope, {
                thisTab: () => {
                    decrementOffset();
                    chatsCacheUpdater.removeFromUserChats({
                        chatId,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "removeFromUserChats",
                        data: { chatId },
                    });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        incrementOffset();
                        chatsCacheUpdater.revertLastChatsUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatsUpdate" });
                    },
                });
        },
        [postMessage, decrementOffset, chatsCacheUpdater, incrementOffset],
    );

    const clearChats = useCallback(
        ({ scope }: ClearChatsProps = {}) => {
            tabScope(scope, {
                thisTab: () => {
                    setOffset(prevClientOffset ?? 0);
                    chatsCacheUpdater.clearUserChats();
                },
                otherTabs: () => {
                    postMessage({ type: "clearUserChats" });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        setOffset(prevClientOffset ?? 0);
                        chatsCacheUpdater.revertLastChatsUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatsUpdate" });
                    },
                });
        },
        [postMessage, prevClientOffset, setOffset, chatsCacheUpdater],
    );

    const updateChatVisibility = useCallback(
        ({ chatId, visibility, scope }: UpdateChatVisibilityProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.updateChatVisibility({
                        chatId,
                        visibility,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "updateChatVisibility",
                        data: { chatId, visibility },
                    });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        chatsCacheUpdater.revertLastChatUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatUpdate" });
                    },
                });
        },
        [postMessage, chatsCacheUpdater],
    );

    const updateChatTitle = useCallback(
        ({ chatId, newTitle, scope }: UpdateChatTitleProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.updateChatTitle({
                        chatId,
                        newTitle,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "updateChatTitle",
                        data: { chatId, newTitle },
                    });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        chatsCacheUpdater.revertLastChatUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatUpdate" });
                    },
                });
        },
        [postMessage, chatsCacheUpdater],
    );

    const invalidateSharedChats = useCallback(
        ({ scope }: InvalidateSharedChatsProps = {}) => {
            tabScope(scope, {
                thisTab: () => {
                    queryClient.invalidateQueries({
                        queryKey: [tag.userSharedChats()],
                    });
                },
                otherTabs: () => {
                    postMessage({ type: "invalidateSharedChats" });
                },
            });
        },
        [postMessage, queryClient],
    );

    const invalidateInitialUserChatsSearch = useCallback(
        ({ scope }: InvalidateInitialUserChatsSearchProps = {}) => {
            tabScope(scope, {
                thisTab: () => {
                    queryClient.invalidateQueries({
                        queryKey: [tag.userInitialChatsSearch()],
                    });
                },
                otherTabs: () => {
                    postMessage({ type: "invalidateInitialUserChatsSearch" });
                },
            });
        },
        [postMessage, queryClient],
    );

    const addToInitialUserChatsSearch = useCallback(
        ({ chat, limit, scope }: AddToInitialUserChatsSearchProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.addToInitialUserChatsSearch({
                        chat,
                        limit,
                    });
                },

                otherTabs: () => {
                    postMessage({
                        type: "addToInitialUserChatsSearch",
                        data: { chat, limit },
                    });
                },
            });
        },
        [postMessage, chatsCacheUpdater],
    );

    const updateInitialUserChatsSearch = useCallback(
        ({ chatId, updater, scope }: UpdateInitialUserChatsSearchProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.updateInitialUserChatsSearch({
                        chatId,
                        updater,
                    });
                },

                otherTabs: () => {
                    postMessage({
                        type: "updateInitialUserChatsSearch",
                        data: { chatId, updater },
                    });
                },
            });
        },
        [postMessage, chatsCacheUpdater],
    );

    const upsertInitialUserChatsSearch = useCallback(
        ({ chatId, chat, limit, scope }: UpsertInitialUserChatsSearchProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.upsertInitialUserChatsSearch({
                        chatId,
                        chat,
                        limit,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "upsertInitialUserChatsSearch",
                        data: { chatId, chat, limit },
                    });
                },
            });
            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        chatsCacheUpdater.revertLastChatsUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastChatsUpdate" });
                    },
                });
        },
        [postMessage, chatsCacheUpdater],
    );

    const updateInitialUserChatsSearchTitle = useCallback(
        ({
            chatId,
            newTitle,
            scope,
        }: UpdateInitialUserChatsSearchTitleProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.updateInitialUserChatsSearchTitle({
                        chatId,
                        newTitle,
                    });
                },

                otherTabs: () => {
                    postMessage({
                        type: "updateInitialUserChatsSearchTitle",
                        data: { chatId, newTitle },
                    });
                },
            });
        },
        [postMessage, chatsCacheUpdater],
    );

    const clearInitialUserChatsSearch = useCallback(
        ({ scope }: ClearInitialUserChatsSearchProps = {}) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.clearInitialUserChatsSearch();
                },

                otherTabs: () => {
                    postMessage({ type: "clearInitialUserChatsSearch" });
                },
            });
        },
        [postMessage, chatsCacheUpdater],
    );

    const removeFromSharedChats = useCallback(
        ({ chatId, scope }: RemoveFromSharedChatsProps) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.removeFromUserSharedChats({
                        chatId,
                    });
                },
                otherTabs: () => {
                    postMessage({
                        type: "removeFromSharedChats",
                        data: { chatId },
                    });
                },
            });
        },
        [postMessage, chatsCacheUpdater],
    );

    const removeAllSharedChats = useCallback(
        ({ scope }: RemoveAllSharedChatsProps = {}) => {
            tabScope(scope, {
                thisTab: () => {
                    chatsCacheUpdater.removeAllUserSharedChats();
                },
                otherTabs: () => {
                    postMessage({ type: "removeAllSharedChats" });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        chatsCacheUpdater.revertLastSharedChatsUpdate();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastSharedChatsUpdate" });
                    },
                });
        },
        [postMessage, chatsCacheUpdater],
    );

    const value = useMemo(
        () => ({
            addChat,
            updateChat,
            updateChats,
            removeChat,
            clearChats,
            updateChatVisibility,
            updateChatTitle,
            invalidateSharedChats,
            invalidateInitialUserChatsSearch,
            addToInitialUserChatsSearch,
            updateInitialUserChatsSearch,
            upsertInitialUserChatsSearch,
            updateInitialUserChatsSearchTitle,
            clearInitialUserChatsSearch,
            removeFromSharedChats,
            removeAllSharedChats,
        }),
        [
            addChat,
            updateChat,
            updateChats,
            removeChat,
            clearChats,
            updateChatVisibility,
            invalidateInitialUserChatsSearch,
            addToInitialUserChatsSearch,
            updateInitialUserChatsSearch,
            updateChatTitle,
            invalidateSharedChats,
            upsertInitialUserChatsSearch,
            updateInitialUserChatsSearchTitle,
            clearInitialUserChatsSearch,
            removeFromSharedChats,
            removeAllSharedChats,
        ],
    );

    return (
        <ChatCacheSyncContext value={value}>{children}</ChatCacheSyncContext>
    );
}

export function useChatCacheSyncContext() {
    const context = useContext(ChatCacheSyncContext);

    if (!context) {
        throw new Error(
            "useChatCacheSyncContext must be used within a ChatCacheSyncProvider",
        );
    }
    return context;
}

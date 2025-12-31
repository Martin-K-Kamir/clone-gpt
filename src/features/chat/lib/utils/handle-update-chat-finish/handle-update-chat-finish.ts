import { INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";
import {
    useChatCacheSyncContext,
    useChatSidebarContext,
} from "@/features/chat/providers";
import { getUserChatById } from "@/features/chat/services/api";

export async function handleUpdateChatFinish({
    chatCacheSync,
    chatSidebarContext,
    chatId,
}: {
    chatCacheSync: ReturnType<typeof useChatCacheSyncContext>;
    chatSidebarContext: ReturnType<typeof useChatSidebarContext>;
    chatId: DBChatId;
}) {
    const updatedAt = new Date().toISOString();

    chatSidebarContext.scrollHistoryToTop();

    chatCacheSync.updateChats({
        chatId,
        chat: { updatedAt },
    });

    const chat = await getUserChatById({ chatId });

    chatCacheSync.upsertInitialUserChatsSearch({
        chatId,
        chat: {
            ...chat,
            updatedAt,
        },
        limit: INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
    });
}

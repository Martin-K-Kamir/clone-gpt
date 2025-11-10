import { INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { getUserChatById } from "@/features/chat/services/api";

export async function handleNewChatFinish({
    chatCacheSync,
    chatId,
}: {
    chatCacheSync: ReturnType<typeof useChatCacheSyncContext>;
    chatId: DBChatId;
}) {
    const chat = await getUserChatById({ chatId });

    window.history.replaceState({}, "", `/chat/${chatId}`);
    chatCacheSync.addChat({ chat });
    chatCacheSync.addToInitialUserChatsSearch({
        chat,
        limit: INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
    });
}

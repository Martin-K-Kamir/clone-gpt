"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DBChat, DBChatId, DBChatVisibility } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { updateManyChatsVisibility } from "@/features/chat/services/actions";

import {
    type ApiErrorResponse,
    type ApiSuccessResponse,
} from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import type { PaginatedData } from "@/lib/types";

export function useBatchUserSharedChats(visibility: DBChatVisibility) {
    const queryClient = useQueryClient();
    const chatCacheSync = useChatCacheSyncContext();

    async function batchOperation(
        data: PaginatedData<DBChat[]> | undefined,
        chatIds: DBChatId[],
    ) {
        const result = await updateManyChatsVisibility({ visibility, chatIds });

        queryClient.invalidateQueries({
            queryKey: [tag.userSharedChats()],
            refetchType: data?.hasNextPage ? "all" : "active",
        });

        if (!result.success) {
            throw new Error(result.message);
        }

        return result;
    }

    function handleBatchSuccess({ data }: ApiSuccessResponse<DBChat[]>) {
        chatCacheSync.invalidateSharedChats({ scope: "otherTabs" });

        data.forEach((chat: DBChat) => {
            chatCacheSync.updateChatVisibility({
                visibility,
                chatId: chat.id,
            });
        });
    }

    function handleBatchError(error: ApiErrorResponse<unknown>) {
        toast.error(error.message);

        queryClient.invalidateQueries({
            queryKey: [tag.userSharedChats()],
        });
    }

    return {
        batchOperation,
        handleBatchSuccess,
        handleBatchError,
    };
}

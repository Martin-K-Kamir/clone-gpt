import type { DBChatVisibility, WithChatId } from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";

export async function getUserChatVisibility({
    chatId,
}: WithChatId): Promise<DBChatVisibility> {
    const response = await fetch(`/api/user-chats/visibility/${chatId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch chat visibility");
    }

    const result = (await response.json()) as ApiResponse<DBChatVisibility>;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result.data;
}

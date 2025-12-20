import type {
    DBChat,
    WithChatId,
    WithIsOwner,
} from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";

export async function getUserChatById({
    chatId,
}: WithChatId): Promise<DBChat & WithIsOwner> {
    if (!chatId) {
        throw new Error("Chat ID is required to fetch a chat");
    }

    const response = await fetch(`/api/user-chats/${chatId}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch chat by ID");
    }

    const result = (await response.json()) as ApiResponse<DBChat & WithIsOwner>;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result.data;
}

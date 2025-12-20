import type { DBChatSearchResult } from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import type {
    DateCursor,
    PaginatedData,
    WithOptionalCursor,
    WithOptionalLimit,
    WithOptionalQuery,
} from "@/lib/types";

type SearchUserChatsProps = WithOptionalQuery &
    WithOptionalCursor &
    WithOptionalLimit;

type SearchUserChatsResponse = {
    data: DBChatSearchResult[];
    hasNextPage: boolean;
    cursor?: DateCursor;
};

export async function searchUserChats({
    query,
    cursor,
    limit,
}: SearchUserChatsProps): Promise<SearchUserChatsResponse> {
    const params = new URLSearchParams();

    if (limit !== undefined) {
        params.set("limit", limit.toString());
    }

    if (query) {
        params.set("query", query);
    }

    if (cursor) {
        params.set("cursorDate", cursor.date);
        params.set("cursorId", cursor.id);
    }

    const response = await fetch(`/api/user-chats/search?${params}`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to search user chats");
    }

    const result = (await response.json()) as ApiResponse<
        PaginatedData<DBChatSearchResult[]>
    >;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result.data;
}

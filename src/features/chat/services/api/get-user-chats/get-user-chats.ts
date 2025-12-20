import type { DBChat } from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import type {
    PaginatedData,
    WithOptionalLimit,
    WithOptionalOffset,
    WithOptionalOrderBy,
} from "@/lib/types";

type GetUserChatsProps = WithOptionalOffset &
    WithOptionalLimit &
    WithOptionalOrderBy;

type GetUserChatsResponse = {
    data: DBChat[];
    hasNextPage: boolean;
    nextOffset?: number;
    totalCount: number;
};

export async function getUserChats({
    offset,
    limit,
    orderBy,
}: GetUserChatsProps): Promise<GetUserChatsResponse> {
    const params = new URLSearchParams();

    if (offset !== undefined) {
        params.set("offset", offset.toString());
    }

    if (limit !== undefined) {
        params.set("limit", limit.toString());
    }

    if (orderBy !== undefined) {
        params.set("orderBy", orderBy);
    }

    const resopnse = await fetch(`/api/user-chats?${params}`);

    if (!resopnse.ok) {
        throw new Error("Failed to fetch user chats");
    }

    const result = (await resopnse.json()) as ApiResponse<
        PaginatedData<DBChat[]>
    >;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result.data;
}

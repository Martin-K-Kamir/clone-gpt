import type { DBChat } from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import type {
    PaginatedData,
    WithOptionalLimit,
    WithOptionalOffset,
} from "@/lib/types";

type GetUserSharedChatsProps = WithOptionalOffset & WithOptionalLimit;

type GetUserSharedChatsResponse = {
    data: DBChat[];
    hasNextPage: boolean;
    nextOffset?: number;
    totalCount: number;
};

export async function getUserSharedChats({
    offset,
    limit,
}: GetUserSharedChatsProps): Promise<GetUserSharedChatsResponse> {
    const params = new URLSearchParams();
    if (offset !== undefined) params.set("offset", String(offset));
    if (limit !== undefined) params.set("limit", String(limit));

    const response = await fetch(`/api/user-chats/shared?${params}`);

    if (!response.ok) {
        throw new Error("Failed to fetch user shared chats");
    }

    const result = (await response.json()) as ApiResponse<
        PaginatedData<DBChat[]>
    >;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result.data;
}

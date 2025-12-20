import type { DBChat } from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import type {
    WithOptionalFromDate,
    WithOptionalLimit,
    WithOptionalOrderBy,
    WithOptionalToDate,
} from "@/lib/types";

type GetUserChatsByDateProps = WithOptionalFromDate &
    WithOptionalToDate &
    WithOptionalLimit &
    WithOptionalOrderBy;

export async function getUserChatsByDate({
    from,
    to,
    limit,
    orderBy,
}: GetUserChatsByDateProps): Promise<DBChat[]> {
    const params = new URLSearchParams();

    if (from) {
        params.set("from", from.toISOString());
    }

    if (to) {
        params.set("to", to.toISOString());
    }

    if (limit !== undefined) {
        params.set("limit", limit.toString());
    }

    if (orderBy !== undefined) {
        params.set("orderBy", orderBy);
    }

    const response = await fetch(`/api/user-chats?${params}`);

    if (!response.ok) {
        throw new Error("Failed to fetch user chats by date");
    }

    const result = (await response.json()) as ApiResponse<DBChat[]>;

    if (!result.success) {
        throw new Error(result.message);
    }

    return result.data;
}

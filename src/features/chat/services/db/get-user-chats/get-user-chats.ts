"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

import type { DBChat, WithIsOwner } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { assertIsNumber } from "@/lib/asserts";
import { tag } from "@/lib/cache-tags";
import { ORDER_BY } from "@/lib/constants";
import type {
    PaginatedData,
    WithOptionalLimit,
    WithOptionalOffset,
    WithOptionalOrderBy,
} from "@/lib/types";

import { supabase } from "@/services/supabase";

type GetUserChatsProps = WithUserId &
    WithOptionalOffset &
    WithOptionalLimit &
    WithOptionalOrderBy;

export async function getUserChats({
    userId,
    offset = 0,
    limit = Number.MAX_SAFE_INTEGER,
    orderBy = ORDER_BY.CREATED_AT,
}: GetUserChatsProps): Promise<PaginatedData<DBChat[]>> {
    "use cache";

    assertIsDBUserId(userId);
    assertIsNumber(offset);
    assertIsNumber(limit);
    cacheTag(tag.userChats(userId));

    const from = offset;
    const to = offset + limit - 1;

    const { data, error, count } = await supabase
        .from("chats")
        .select("*", { count: "exact" })
        .eq("userId", userId)
        .order(orderBy, { ascending: false })
        .range(from, to);

    if (error) throw new Error("Failed to fetch user chats");

    const totalCount = count ?? 0;
    const hasNextPage = to + 1 < totalCount;
    const nextOffset = hasNextPage ? to + 1 : undefined;

    return {
        data: data.map(chat => ({
            ...chat,
            isOwner: chat.userId === userId,
        })) as (DBChat & WithIsOwner)[],
        totalCount,
        hasNextPage,
        nextOffset,
    };
}

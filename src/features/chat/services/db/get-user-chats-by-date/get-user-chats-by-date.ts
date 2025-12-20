"use server";

import { cacheTag } from "next/cache";

import type { DBChat } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { assertIsDate, assertIsNumber } from "@/lib/asserts";
import { tag } from "@/lib/cache-tag";
import { ORDER_BY } from "@/lib/constants";
import type {
    WithOptionalFrom,
    WithOptionalLimit,
    WithOptionalOrderBy,
    WithOptionalTo,
} from "@/lib/types";
import { toISOString } from "@/lib/utils";

import { supabase } from "@/services/supabase";

type GetUserChatsByDateProps = WithUserId &
    WithOptionalFrom &
    WithOptionalTo &
    WithOptionalOrderBy &
    WithOptionalLimit;

export async function getUserChatsByDate({
    userId,
    from,
    to = new Date(),
    limit = Number.MAX_SAFE_INTEGER,
    orderBy = ORDER_BY.CREATED_AT,
}: GetUserChatsByDateProps): Promise<DBChat[]> {
    "use cache";
    assertIsDBUserId(userId);
    assertIsNumber(limit);
    if (from) assertIsDate(from);
    if (to) assertIsDate(to);

    const fromISOString = from ? toISOString(from) : toISOString(new Date(0));
    const toISOStringValue = toISOString(to);

    cacheTag(tag.userChats(userId));

    const query = supabase
        .from("chats")
        .select("*")
        .eq("userId", userId)
        .order(orderBy, { ascending: false })
        .limit(limit)
        .gte(orderBy, fromISOString)
        .lte(orderBy, toISOStringValue);

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch chats by date: ${error.message}`);
    }

    return data as DBChat[];
}

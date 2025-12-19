"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

import type { DBChat } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { assertIsNumber } from "@/lib/asserts";
import { tag } from "@/lib/cache-tags";
import type {
    PaginatedData,
    WithOptionalLimit,
    WithOptionalOffset,
} from "@/lib/types";

import { supabase } from "@/services/supabase";

type GetUserSharedChatsProps = WithOptionalOffset &
    WithOptionalLimit &
    WithUserId;

export async function getUserSharedChats({
    userId,
    offset = 0,
    limit = Number.MAX_SAFE_INTEGER,
}: GetUserSharedChatsProps): Promise<PaginatedData<DBChat[]>> {
    "use cache";
    assertIsDBUserId(userId);
    assertIsNumber(offset);
    assertIsNumber(limit);
    cacheTag(tag.userSharedChats(userId));

    const safeOffset = Math.max(0, offset);
    const safeLimit = Math.max(1, limit);
    const from = safeOffset;
    const to = safeOffset + safeLimit - 1;

    const { data, error, count } = await supabase
        .from("chats")
        .select("*", { count: "exact" })
        .eq("visibility", "public")
        .eq("userId", userId)
        .order("visibleAt", { ascending: false })
        .range(from, to);

    if (error) throw new Error("Failed to fetch shared chats");

    const totalCount = count ?? 0;
    const hasNextPage = to + 1 < totalCount;
    const nextOffset = hasNextPage ? to + 1 : undefined;

    const sortedData = (data as DBChat[]).sort(
        (a, b) =>
            new Date(b.visibleAt).getTime() - new Date(a.visibleAt).getTime(),
    );

    return {
        data: sortedData ?? [],
        totalCount,
        hasNextPage,
        nextOffset,
    };
}

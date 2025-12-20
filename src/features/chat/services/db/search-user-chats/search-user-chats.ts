"use server";

import { cacheTag } from "next/cache";

import type { DBChatId, DBChatSearchResult } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import {
    assertIsDateCursor,
    assertIsNonEmptyString,
    assertIsNumber,
} from "@/lib/asserts";
import { tag } from "@/lib/cache-tag";
import type {
    DateCursor,
    PaginatedData,
    WithOptionalCursor,
    WithOptionalLimit,
    WithQuery,
} from "@/lib/types";
import { extractQuerySnippet } from "@/lib/utils";

import { supabase } from "@/services/supabase";

type SearchUserChatsProps = WithQuery &
    WithOptionalCursor &
    WithOptionalLimit &
    WithUserId;

export async function searchUserChats({
    userId,
    query,
    cursor,
    limit = Number.MAX_SAFE_INTEGER,
}: SearchUserChatsProps): Promise<PaginatedData<DBChatSearchResult[]>> {
    "use cache";
    assertIsDBUserId(userId);
    assertIsNonEmptyString(query);
    assertIsNumber(limit);
    if (cursor) assertIsDateCursor(cursor);

    cacheTag(tag.userChatsSearch(userId, query));
    cacheTag(tag.userChats(userId));

    const messageQuery = supabase
        .from("messages")
        .select("chatId, content")
        .eq("userId", userId)
        .ilike("content", `%${query}%`);

    const { data: messageMatches, error: messageQueryError } =
        await messageQuery;

    if (messageQueryError) {
        throw new Error(
            `Failed to query message chat IDs: ${messageQueryError.message}`,
        );
    }

    const contentMatchingChatIds = [
        ...new Set(messageMatches?.map(m => m.chatId) || []),
    ];

    let chatQuery = supabase
        .from("chats")
        .select("*")
        .eq("userId", userId)
        .or(
            `id.in.(${contentMatchingChatIds.join(",")}),title.ilike.%${query}%`,
        );

    if (cursor) {
        chatQuery = chatQuery.or(
            `createdAt.lt.${cursor.date},and(createdAt.eq.${cursor.date},id.lt.${cursor.id})`,
        );
    }

    const { data: chatMatches, error: chatQueryError } = await chatQuery
        .order("createdAt", { ascending: false })
        .limit(limit + 1);
    if (chatQueryError) {
        throw new Error(`Failed to query chats: ${chatQueryError.message}`);
    }

    const transformedData =
        chatMatches?.map(chat => {
            const matchesContent = contentMatchingChatIds.includes(chat.id);
            const contentToUse = matchesContent
                ? messageMatches?.find(m => m.chatId === chat.id)?.content ||
                  chat.title
                : chat.title;

            return {
                ...chat,
                id: chat.id as DBChatId,
                snippet: extractQuerySnippet(contentToUse, query),
                userId,
            };
        }) || [];

    const hasNextPage = transformedData.length > limit;
    const pageResults = hasNextPage
        ? transformedData.slice(0, limit)
        : transformedData;

    let nextCursor: DateCursor | undefined;
    if (hasNextPage && pageResults.length > 0) {
        const lastItem = pageResults[pageResults.length - 1];
        nextCursor = {
            date: lastItem.createdAt,
            id: lastItem.id,
        };
    }

    return {
        data: pageResults,
        totalCount: transformedData.length,
        hasNextPage,
        cursor: nextCursor,
    };
}

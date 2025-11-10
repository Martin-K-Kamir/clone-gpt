"use client";

import {
    InfiniteData,
    useInfiniteQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";

import type { DBChatSearchResult } from "@/features/chat/lib/types";
import { searchUserChats } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tags";
import type { DateCursor } from "@/lib/types";

import { useInView } from "@/hooks";

type UseInfiniteSearchUserChatsOptions = Partial<{
    threshold: number;
    limit: number;
    debounceTime: number;
    staleTime: number;
}>;

export function useInfiniteSearchUserChats(
    query: string,
    ref: React.RefObject<Element | null>,
    options?: UseInfiniteSearchUserChatsOptions,
) {
    const {
        debounceTime = 300,
        staleTime = 1000 * 60 * 60,
        threshold,
        limit,
    } = options || {};

    const queryClient = useQueryClient();
    const [debouncedQuery] = useDebounceValue(query, debounceTime);

    const {
        data,
        error,
        hasNextPage,
        isFetching,
        isLoading,
        isPending,
        isFetchingNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: [tag.userChatsSearch(), debouncedQuery],
        enabled: !!debouncedQuery,
        queryFn: ({ pageParam }) =>
            searchUserChats({
                limit,
                query: debouncedQuery,
                cursor: pageParam,
            }),
        getNextPageParam: lastPage =>
            lastPage.hasNextPage ? lastPage.cursor : undefined,
        initialPageParam: undefined as DateCursor | undefined,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        staleTime,
    });

    useInView(ref, {
        onEnter: () => {
            if (!hasNextPage || isFetchingNextPage) {
                return;
            }

            fetchNextPage();
        },
        threshold,
    });

    const cachedData = queryClient.getQueryData<
        InfiniteData<
            {
                data: DBChatSearchResult[];
                hasNextPage: boolean;
                cursor?: DateCursor;
            },
            unknown
        >
    >([tag.userChatsSearch(), query]);

    const searchResults = data?.pages.flatMap(page => page.data) || [];
    const cachedSearchResults =
        cachedData?.pages.flatMap(page => page.data) || [];
    const hasCachedResults = cachedSearchResults.length > 0;
    const hasResults = searchResults.length > 0;
    const isTyping = query.length > 0;
    const isDebouncing = query !== debouncedQuery;

    const isSearching = (isPending || isDebouncing) && isTyping;
    const isEmpty = !isSearching && !hasResults && !error && isTyping;
    const isError = !isSearching && !hasResults && error;

    return {
        error,
        isError,
        isDebouncing,
        isSearching,
        isEmpty,
        isFetchingNextPage,
        isFetching,
        isLoading,
        hasNextPage,
        fetchNextPage,
        searchResults: cachedSearchResults.map(result => ({
            ...result,
            href: `/chat/${result.id}`,
        })),
        hasResults: hasCachedResults,
    };
}

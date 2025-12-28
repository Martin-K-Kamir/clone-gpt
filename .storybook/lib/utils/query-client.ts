import { QueryClient } from "@tanstack/react-query";

import { tag } from "../../../src/lib/cache-tag";
import { getQueryClient } from "../../../src/providers/query-provider";

export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                staleTime: 60 * 1000,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            },
        },
    });
}

export function clearQueriesByTag(cacheTag: string): void {
    const queryClient = getQueryClient();
    queryClient.removeQueries({
        predicate: query => {
            const key = query.queryKey;
            return Array.isArray(key) && key.length > 0 && key[0] === cacheTag;
        },
    });
    queryClient.cancelQueries({
        predicate: query => {
            const key = query.queryKey;
            return Array.isArray(key) && key.length > 0 && key[0] === cacheTag;
        },
    });
}

export function clearUserSharedChatsQueries(): void {
    clearQueriesByTag(tag.userSharedChats());
}

export function clearUserChatsQueries(): void {
    clearQueriesByTag(tag.userChats());
}

export function clearAllQueries(): void {
    const queryClient = getQueryClient();
    queryClient.clear();
}

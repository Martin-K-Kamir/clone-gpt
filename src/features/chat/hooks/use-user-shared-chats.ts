"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { tag } from "@/lib/cache-tags";

import { getUserSharedChats } from "../services/api";

type UseUserSharedChatsOptions = Partial<{
    limit: number;
    staleTime: number;
    gcTime: number;
}>;

export function useUserSharedChats(options?: UseUserSharedChatsOptions) {
    const { limit } = options || {};

    const [offset, setOffset] = useState(0);

    const queryClient = useQueryClient();

    const { data, isPending, error } = useQuery({
        queryKey: [tag.userSharedChats(), offset, limit],
        queryFn: () => getUserSharedChats({ offset, limit }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (!limit) return;

        const nextOffset = offset + limit;
        const prevOffset = Math.max(0, offset - limit);

        if (data?.hasNextPage) {
            void queryClient.prefetchQuery({
                queryKey: [tag.userSharedChats(), nextOffset, limit],
                queryFn: () =>
                    getUserSharedChats({ offset: nextOffset, limit }),
            });
        }

        if (offset > 0) {
            void queryClient.prefetchQuery({
                queryKey: [tag.userSharedChats(), prevOffset, limit],
                queryFn: () =>
                    getUserSharedChats({ offset: prevOffset, limit }),
            });
        }
    }, [offset, limit, queryClient, data?.hasNextPage]);

    function onNextPage() {
        if (!limit) {
            return;
        }

        const total = data?.totalCount ?? 0;
        const lastOffset = Math.max(
            0,
            Math.floor(Math.max(0, total - 1) / limit) * limit,
        );
        setOffset(o => Math.min(lastOffset, o + limit));
    }

    function onPrevPage() {
        if (!limit) {
            return;
        }

        setOffset(o => Math.max(0, o - limit));
    }

    function onFirstPage() {
        setOffset(0);
    }

    function onLastPage() {
        if (!limit) {
            return;
        }

        const total = data?.totalCount ?? 0;
        const lastOffset = Math.max(
            0,
            Math.floor(Math.max(0, total - 1) / limit) * limit,
        );
        setOffset(lastOffset);
    }

    return {
        data,
        isPending,
        error,
        offset,
        setOffset,
        onNextPage,
        onPrevPage,
        onFirstPage,
        onLastPage,
    };
}

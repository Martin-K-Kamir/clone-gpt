"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import type { UIChat } from "@/features/chat/lib/types";
import { useChatOffsetContext } from "@/features/chat/providers";
import { getUserChats } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tag";
import type { OrderBy, PaginatedData } from "@/lib/types";

import { useInView } from "@/hooks";

type UseInfiniteUserChatsOptions = Partial<{
    initialData: PaginatedData<UIChat[]>;
    limit: number;
    threshold: number;
    orderBy?: OrderBy;
}>;

export function useInfiniteUserChats<TElement extends Element>(
    ref: React.RefObject<TElement | null>,
    options?: UseInfiniteUserChatsOptions,
) {
    const { initialData, limit, threshold, orderBy } = options || {};
    const { clientOffset } = useChatOffsetContext();

    const { data, hasNextPage, isFetchingNextPage, error, fetchNextPage } =
        useSuspenseInfiniteQuery({
            queryKey: [tag.userChats()],
            queryFn: ({ pageParam = 0 }) => {
                return getUserChats({
                    limit,
                    orderBy,
                    offset: pageParam + clientOffset,
                });
            },
            getNextPageParam: lastPage => {
                return lastPage.hasNextPage ? lastPage.nextOffset : undefined;
            },
            initialPageParam: 0,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: false,
            initialData: initialData
                ? { pages: [initialData], pageParams: [0] }
                : undefined,
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

    useEffect(() => {
        if (!error) return;

        toast.error(`${error.message}. Please try again later.`);
    }, [error]);

    return {
        isFetchingNextPage,
        hasNextPage,
        chats: data.pages.flatMap(page => page.data),
        fetchNextPage,
    };
}

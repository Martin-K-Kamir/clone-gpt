import { type InfiniteData, type QueryClient } from "@tanstack/react-query";

import type { PaginatedData } from "@/lib/types";

export function createInfiniteCacheUpdater<
    TItem extends { id: string | number },
>(queryClient: QueryClient, queryKey: readonly unknown[]) {
    let previousState:
        | InfiniteData<PaginatedData<TItem[]>, unknown>
        | undefined;

    const saveCurrentState = () => {
        const currentState = queryClient.getQueryData(queryKey);
        if (currentState) {
            previousState = JSON.parse(JSON.stringify(currentState));
        }
    };

    function add(newItem: TItem) {
        saveCurrentState();

        queryClient.setQueryData(
            queryKey,
            (
                prevData:
                    | InfiniteData<PaginatedData<TItem[]>, unknown>
                    | undefined,
            ) => {
                if (!prevData) return prevData;

                const firstPage = prevData.pages[0];

                if (
                    firstPage &&
                    firstPage.data.some(item => item.id === newItem.id)
                ) {
                    return prevData;
                }

                return {
                    ...prevData,
                    pages: prevData.pages.map((page, index) =>
                        index === 0
                            ? {
                                  ...page,
                                  data: [newItem, ...page.data],
                              }
                            : page,
                    ),
                };
            },
        );
    }

    function remove(itemId: string | number) {
        saveCurrentState();

        queryClient.setQueryData(
            queryKey,
            (
                prevData:
                    | InfiniteData<PaginatedData<TItem[]>, unknown>
                    | undefined,
            ) => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    pages: prevData.pages.map(page => ({
                        ...page,
                        data: page.data.filter(item => item.id !== itemId),
                    })),
                };
            },
        );
    }

    function clear() {
        saveCurrentState();

        queryClient.setQueryData(queryKey, {
            pages: [
                {
                    data: [],
                    hasNextPage: false,
                },
            ],
            pageParams: [],
        });
    }

    function update(itemId: string | number, updater: (item: TItem) => TItem) {
        saveCurrentState();

        queryClient.setQueryData(
            queryKey,
            (
                prevData:
                    | InfiniteData<PaginatedData<TItem[]>, unknown>
                    | undefined,
            ) => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    pages: prevData.pages.map(page => ({
                        ...page,
                        data: page.data.map(item =>
                            item.id === itemId ? updater(item) : item,
                        ),
                    })),
                };
            },
        );
    }

    function revert() {
        if (previousState) {
            queryClient.setQueryData(queryKey, previousState);
            previousState = undefined;
        }
    }

    return {
        add,
        remove,
        clear,
        update,
        revert,
    };
}

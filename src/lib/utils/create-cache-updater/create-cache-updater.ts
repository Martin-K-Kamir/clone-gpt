import { type QueryClient } from "@tanstack/react-query";

export function createCacheUpdater<TItem extends { id: string | number }>(
    queryClient: QueryClient,
) {
    let previousState: TItem | undefined;
    let previousQueryKey: readonly unknown[] | undefined;

    const saveCurrentState = (queryKey: readonly unknown[]) => {
        const currentState = queryClient.getQueryData(queryKey);
        if (currentState) {
            previousState = JSON.parse(JSON.stringify(currentState));
            previousQueryKey = queryKey;
        }
    };

    function set(queryKey: readonly unknown[], newItem: TItem) {
        saveCurrentState(queryKey);
        queryClient.setQueryData(queryKey, newItem);
    }

    function update(
        queryKey: readonly unknown[],
        updater: (item: TItem) => TItem,
    ) {
        saveCurrentState(queryKey);
        queryClient.setQueryData(queryKey, updater);
    }

    function patch(
        queryKey: readonly unknown[],
        partialUpdate: Partial<TItem>,
    ) {
        saveCurrentState(queryKey);
        queryClient.setQueryData(queryKey, (old: TItem | undefined) => {
            if (!old) return partialUpdate as TItem;
            return { ...old, ...partialUpdate };
        });
    }

    function remove(queryKey: readonly unknown[]) {
        saveCurrentState(queryKey);
        queryClient.setQueryData(queryKey, undefined);
    }

    function revert() {
        if (previousState && previousQueryKey) {
            queryClient.setQueryData(previousQueryKey, previousState);
            previousState = undefined;
            previousQueryKey = undefined;
        }
    }

    return {
        set,
        update,
        patch,
        remove,
        revert,
    };
}

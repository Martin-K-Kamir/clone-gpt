"use client";

import { useMemo, useState } from "react";

type SelectableItem = {
    id: string;
    [key: string]: unknown;
};

type UseSelectableItemsOptions = {
    maxVisible?: number;
};

export function useSelectableItems<TSelectableItem extends SelectableItem>(
    allItems: TSelectableItem[],
    options: UseSelectableItemsOptions = {},
) {
    const { maxVisible = 8 } = options;

    const [_allItems, _setAllItems] = useState<TSelectableItem[]>(allItems);
    const [visibleCount, setVisibleCount] = useState(maxVisible);
    const [selectedItems, setSelectedItems] = useState<TSelectableItem[]>([]);

    const availableItems = useMemo(
        () =>
            _allItems.filter(
                item =>
                    !selectedItems.some(selected => selected.id === item.id),
            ),
        [_allItems, selectedItems],
    );

    const items = useMemo(
        () => availableItems.slice(0, visibleCount),
        [availableItems, visibleCount],
    );

    const canRefresh = useMemo(
        () => allItems.length > selectedItems.length + items.length,
        [allItems.length, selectedItems.length, items.length],
    );

    const selectItem = (item: TSelectableItem) => {
        setSelectedItems(prev => [...prev, item]);
        setVisibleCount(prev => prev - 1);
    };

    const refreshItems = () => {
        setVisibleCount(maxVisible);

        const available = allItems.filter(
            item => !selectedItems.some(selected => selected.id === item.id),
        );

        const shuffled = [...available].sort(() => Math.random() - 0.5);
        _setAllItems(shuffled);
    };

    return {
        items,
        selectedItems,
        canRefresh,
        selectItem,
        refreshItems,
        setSelectedItems,
    } as const;
}

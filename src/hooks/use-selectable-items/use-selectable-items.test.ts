import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSelectableItems } from "./use-selectable-items";

describe("useSelectableItems", () => {
    const createItems = (count: number) =>
        Array.from({ length: count }, (_, i) => ({
            id: `item-${i}`,
            name: `Item ${i}`,
        }));

    it("should return initial items up to maxVisible", () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        expect(result.current.items).toHaveLength(5);
        expect(result.current.selectedItems).toHaveLength(0);
        expect(result.current.canRefresh).toBe(true);
    });

    it("should use default maxVisible of 8", () => {
        const items = createItems(10);
        const { result } = renderHook(() => useSelectableItems(items));

        expect(result.current.items).toHaveLength(8);
    });

    it("should select item and remove it from available items", async () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        const initialItemsLength = result.current.items.length;
        const itemToSelect = result.current.items[0];
        const itemId = itemToSelect.id;

        result.current.selectItem(itemToSelect);

        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(1);
            expect(result.current.selectedItems[0].id).toBe(itemId);
            expect(result.current.items).toHaveLength(initialItemsLength - 1);
            expect(result.current.items.some(item => item.id === itemId)).toBe(
                false,
            );
        });
    });

    it("should decrease visible count when item is selected", async () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        const initialLength = result.current.items.length;
        expect(initialLength).toBe(5);

        result.current.selectItem(result.current.items[0]);

        await waitFor(() => {
            expect(result.current.items).toHaveLength(initialLength - 1);
        });
    });

    it("should add selected item to selectedItems array", async () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        const item1 = result.current.items[0];
        const item2 = result.current.items[1];

        result.current.selectItem(item1);
        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(1);
        });

        result.current.selectItem(item2);
        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(2);
            expect(
                result.current.selectedItems.some(item => item.id === item1.id),
            ).toBe(true);
            expect(
                result.current.selectedItems.some(item => item.id === item2.id),
            ).toBe(true);
        });
    });

    it("should exclude selected items from available items", async () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 10 }),
        );

        const selected = [result.current.items[0], result.current.items[1]];

        result.current.selectItem(selected[0]);
        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(1);
        });

        result.current.selectItem(selected[1]);
        await waitFor(() => {
            const availableIds = result.current.items.map(item => item.id);
            expect(availableIds).not.toContain(selected[0].id);
            expect(availableIds).not.toContain(selected[1].id);
        });
    });

    it("should refresh items and reset visible count", async () => {
        const items = createItems(20);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        const initialLength = result.current.items.length;
        const item1 = result.current.items[0];
        const item2 = result.current.items[1];

        result.current.selectItem(item1);
        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(1);
        });

        result.current.selectItem(item2);
        await waitFor(() => {
            expect(result.current.items).toHaveLength(initialLength - 2);
        });

        result.current.refreshItems();

        await waitFor(() => {
            expect(result.current.items).toHaveLength(5);
            expect(
                result.current.items.some(item => item.id === item1.id),
            ).toBe(false);
            expect(
                result.current.items.some(item => item.id === item2.id),
            ).toBe(false);
        });
    });

    it("should exclude selected items when refreshing", async () => {
        const items = createItems(20);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        const selected = result.current.items[0];
        result.current.selectItem(selected);

        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(1);
        });

        result.current.refreshItems();

        await waitFor(() => {
            const refreshedIds = result.current.items.map(item => item.id);
            expect(refreshedIds).not.toContain(selected.id);
            expect(result.current.selectedItems).toHaveLength(1);
            expect(result.current.selectedItems[0].id).toBe(selected.id);
        });
    });

    it("should return canRefresh as true when more items available", () => {
        const items = createItems(20);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        expect(result.current.canRefresh).toBe(true);

        for (let i = 0; i < 10; i++) {
            result.current.selectItem(result.current.items[0]);
        }

        expect(result.current.canRefresh).toBe(true);
    });

    it("should return canRefresh as false when all items selected or visible", async () => {
        const items = createItems(5);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 3 }),
        );

        expect(result.current.canRefresh).toBe(true);

        result.current.setSelectedItems(items);

        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(items.length);
            expect(result.current.canRefresh).toBe(false);
        });
    });

    it("should allow setting selectedItems directly", async () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 5 }),
        );

        const newSelected = [items[0], items[1]];
        result.current.setSelectedItems(newSelected);

        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(2);
            expect(
                result.current.selectedItems.some(
                    item => item.id === items[0].id,
                ),
            ).toBe(true);
            expect(
                result.current.selectedItems.some(
                    item => item.id === items[1].id,
                ),
            ).toBe(true);
            expect(
                result.current.items.some(item => item.id === items[0].id),
            ).toBe(false);
            expect(
                result.current.items.some(item => item.id === items[1].id),
            ).toBe(false);
        });
    });

    it("should update available items when selectedItems changes", async () => {
        const items = createItems(10);
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 10 }),
        );

        const initialLength = result.current.items.length;

        result.current.setSelectedItems([items[0], items[1]]);

        await waitFor(() => {
            expect(result.current.items.length).toBe(initialLength - 2);
            expect(
                result.current.items.some(item => item.id === items[0].id),
            ).toBe(false);
            expect(
                result.current.items.some(item => item.id === items[1].id),
            ).toBe(false);
        });
    });

    it("should handle empty items array", () => {
        const { result } = renderHook(() =>
            useSelectableItems([], { maxVisible: 5 }),
        );

        expect(result.current.items).toHaveLength(0);
        expect(result.current.selectedItems).toHaveLength(0);
        expect(result.current.canRefresh).toBe(false);
    });

    it("should maintain item properties when selecting", async () => {
        const items = [
            { id: "1", name: "Item 1", category: "A" },
            { id: "2", name: "Item 2", category: "B" },
        ];
        const { result } = renderHook(() =>
            useSelectableItems(items, { maxVisible: 2 }),
        );

        const item = result.current.items[0];
        const originalItem = items.find(i => i.id === item.id);
        result.current.selectItem(item);

        await waitFor(() => {
            expect(result.current.selectedItems).toHaveLength(1);
            const selected = result.current.selectedItems[0];
            expect(selected.id).toBe(originalItem?.id);
            expect(selected.name).toBe(originalItem?.name);
            expect(selected.category).toBe(originalItem?.category);
        });
    });
});

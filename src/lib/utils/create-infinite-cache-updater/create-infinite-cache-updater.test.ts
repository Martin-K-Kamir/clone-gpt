import { type InfiniteData, QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import type { PaginatedData } from "@/lib/types";

import { createInfiniteCacheUpdater } from "./create-infinite-cache-updater";

type TestItem = {
    id: string;
    name: string;
    value?: number;
};

const createMockInfiniteData = (
    items: TestItem[][],
    hasNextPage = false,
): InfiniteData<PaginatedData<TestItem[]>, unknown> => ({
    pages: items.map(pageItems => ({
        data: pageItems,
        totalCount: pageItems.length,
        hasNextPage,
    })),
    pageParams: items.map((_, index) => index),
});

describe("createInfiniteCacheUpdater", () => {
    let queryClient: QueryClient;
    let queryKey: readonly unknown[];
    let cacheUpdater: ReturnType<typeof createInfiniteCacheUpdater<TestItem>>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        queryKey = ["test", "infinite"];
        cacheUpdater = createInfiniteCacheUpdater<TestItem>(
            queryClient,
            queryKey,
        );
    });

    describe("add", () => {
        it("should add new item to first page", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
                [{ id: "2", name: "Item 2" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            const newItem: TestItem = { id: "3", name: "New Item" };
            cacheUpdater.add(newItem);

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].data).toEqual([
                newItem,
                { id: "1", name: "Item 1" },
            ]);
            expect(updatedData?.pages[1].data).toEqual([
                { id: "2", name: "Item 2" },
            ]);
        });

        it("should not add duplicate items", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            const duplicateItem: TestItem = { id: "1", name: "Duplicate" };
            cacheUpdater.add(duplicateItem);

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].data).toEqual([
                { id: "1", name: "Item 1" },
            ]);
        });

        it("should not modify data if prevData is undefined", () => {
            cacheUpdater.add({ id: "1", name: "New Item" });

            const data = queryClient.getQueryData(queryKey);
            expect(data).toBeUndefined();
        });

        it("should save previous state before adding", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.add({ id: "2", name: "New Item" });
            cacheUpdater.revert();

            const revertedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(revertedData).toEqual(initialData);
        });
    });

    describe("remove", () => {
        it("should remove item from all pages", () => {
            const initialData = createMockInfiniteData([
                [
                    { id: "1", name: "Item 1" },
                    { id: "2", name: "Item 2" },
                ],
                [
                    { id: "3", name: "Item 3" },
                    { id: "1", name: "Item 1 Duplicate" },
                ],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.remove("1");

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].data).toEqual([
                { id: "2", name: "Item 2" },
            ]);
            expect(updatedData?.pages[1].data).toEqual([
                { id: "3", name: "Item 3" },
            ]);
        });

        it("should not modify data if prevData is undefined", () => {
            cacheUpdater.remove("1");

            const data = queryClient.getQueryData(queryKey);
            expect(data).toBeUndefined();
        });

        it("should save previous state before removing", () => {
            const initialData = createMockInfiniteData([
                [
                    { id: "1", name: "Item 1" },
                    { id: "2", name: "Item 2" },
                ],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.remove("1");
            cacheUpdater.revert();

            const revertedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(revertedData).toEqual(initialData);
        });

        it("should handle removing non-existent item", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.remove("999");

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].data).toEqual([
                { id: "1", name: "Item 1" },
            ]);
        });
    });

    describe("clear", () => {
        it("should clear all pages and reset to empty first page", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
                [{ id: "2", name: "Item 2" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.clear();

            const clearedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(clearedData?.pages).toHaveLength(1);
            expect(clearedData?.pages[0].data).toEqual([]);
            expect(clearedData?.pages[0].hasNextPage).toBe(false);
            expect(clearedData?.pageParams).toEqual([]);
        });

        it("should save previous state before clearing", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.clear();
            cacheUpdater.revert();

            const revertedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(revertedData).toEqual(initialData);
        });
    });

    describe("update", () => {
        it("should update item in all pages", () => {
            const initialData = createMockInfiniteData([
                [
                    { id: "1", name: "Item 1" },
                    { id: "2", name: "Item 2" },
                ],
                [{ id: "1", name: "Item 1 Duplicate" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.update("1", item => ({ ...item, name: "Updated" }));

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].data).toEqual([
                { id: "1", name: "Updated" },
                { id: "2", name: "Item 2" },
            ]);
            expect(updatedData?.pages[1].data).toEqual([
                { id: "1", name: "Updated" },
            ]);
        });

        it("should not modify data if prevData is undefined", () => {
            cacheUpdater.update("1", item => ({ ...item, name: "Updated" }));

            const data = queryClient.getQueryData(queryKey);
            expect(data).toBeUndefined();
        });

        it("should save previous state before updating", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.update("1", item => ({ ...item, name: "Updated" }));
            cacheUpdater.revert();

            const revertedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(revertedData).toEqual(initialData);
        });

        it("should handle updating non-existent item", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.update("999", item => ({ ...item, name: "Updated" }));

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].data).toEqual([
                { id: "1", name: "Item 1" },
            ]);
        });
    });

    describe("revert", () => {
        it("should revert to previous state", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.add({ id: "2", name: "New Item" });
            cacheUpdater.revert();

            const revertedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(revertedData).toEqual(initialData);
        });

        it("should clear previous state after reverting", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.add({ id: "2", name: "New Item" });
            cacheUpdater.revert();

            const firstRevert = queryClient.getQueryData(queryKey);
            cacheUpdater.revert();

            const secondRevert = queryClient.getQueryData(queryKey);
            expect(firstRevert).toEqual(secondRevert);
        });

        it("should do nothing if there is no previous state", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.revert();

            const data = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(data).toEqual(initialData);
        });
    });

    describe("deep cloning", () => {
        it("should create deep copy of previous state", () => {
            const initialData = createMockInfiniteData([
                [{ id: "1", name: "Item 1" }],
            ]);
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.add({ id: "2", name: "New Item" });

            const originalPage = initialData.pages[0];
            originalPage.data[0].name = "Modified";

            cacheUpdater.revert();

            const revertedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(revertedData?.pages[0].data[0].name).toBe("Item 1");
        });
    });

    describe("hasNextPage preservation", () => {
        it("should preserve hasNextPage when adding items", () => {
            const initialData = createMockInfiniteData(
                [[{ id: "1", name: "Item 1" }]],
                true,
            );
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.add({ id: "2", name: "New Item" });

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].hasNextPage).toBe(true);
        });

        it("should preserve hasNextPage when removing items", () => {
            const initialData = createMockInfiniteData(
                [[{ id: "1", name: "Item 1" }]],
                true,
            );
            queryClient.setQueryData(queryKey, initialData);

            cacheUpdater.remove("1");

            const updatedData = queryClient.getQueryData(queryKey) as
                | InfiniteData<PaginatedData<TestItem[]>, unknown>
                | undefined;

            expect(updatedData?.pages[0].hasNextPage).toBe(true);
        });
    });
});

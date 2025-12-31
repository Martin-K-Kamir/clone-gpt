import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { createCacheUpdater } from "./create-cache-updater";

type TestItem = {
    id: string;
    name: string;
    value?: number;
};

describe("createCacheUpdater", () => {
    let queryClient: QueryClient;
    let cacheUpdater: ReturnType<typeof createCacheUpdater<TestItem>>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        cacheUpdater = createCacheUpdater<TestItem>(queryClient);
    });

    describe("set", () => {
        it("should set new item in cache", () => {
            const queryKey = ["test", "item"];
            const newItem: TestItem = { id: "1", name: "Test Item" };

            cacheUpdater.set(queryKey, newItem);

            expect(queryClient.getQueryData(queryKey)).toEqual(newItem);
        });

        it("should save previous state before setting new item", () => {
            const queryKey = ["test", "item"];
            const oldItem: TestItem = { id: "1", name: "Old Item" };
            const newItem: TestItem = { id: "1", name: "New Item" };

            queryClient.setQueryData(queryKey, oldItem);
            cacheUpdater.set(queryKey, newItem);

            expect(queryClient.getQueryData(queryKey)).toEqual(newItem);
            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual(oldItem);
        });

        it("should not save previous state if cache was empty", () => {
            const queryKey = ["test", "empty"];
            const newItem: TestItem = { id: "1", name: "New Item" };

            cacheUpdater.set(queryKey, newItem);

            expect(queryClient.getQueryData(queryKey)).toEqual(newItem);
            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual(newItem);
        });
    });

    describe("update", () => {
        it("should update item using updater function", () => {
            const queryKey = ["test", "item"];
            const item: TestItem = { id: "1", name: "Original" };
            queryClient.setQueryData(queryKey, item);

            cacheUpdater.update(queryKey, old => ({
                ...old,
                name: "Updated",
            }));

            expect(queryClient.getQueryData(queryKey)).toEqual({
                id: "1",
                name: "Updated",
            });
        });

        it("should save previous state before updating", () => {
            const queryKey = ["test", "item"];
            const originalItem: TestItem = { id: "1", name: "Original" };
            queryClient.setQueryData(queryKey, originalItem);

            cacheUpdater.update(queryKey, old => ({
                ...old,
                name: "Updated",
            }));

            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual(originalItem);
        });
    });

    describe("patch", () => {
        it("should patch item with partial update", () => {
            const queryKey = ["test", "item"];
            const item: TestItem = { id: "1", name: "Original", value: 10 };
            queryClient.setQueryData(queryKey, item);

            cacheUpdater.patch(queryKey, { name: "Patched" });

            expect(queryClient.getQueryData(queryKey)).toEqual({
                id: "1",
                name: "Patched",
                value: 10,
            });
        });

        it("should create new item if cache is empty", () => {
            const queryKey = ["test", "empty"];
            const partial: Partial<TestItem> = { id: "1", name: "New" };

            cacheUpdater.patch(queryKey, partial);

            expect(queryClient.getQueryData(queryKey)).toEqual({
                id: "1",
                name: "New",
            });
        });

        it("should save previous state before patching", () => {
            const queryKey = ["test", "item"];
            const originalItem: TestItem = { id: "1", name: "Original" };
            queryClient.setQueryData(queryKey, originalItem);

            cacheUpdater.patch(queryKey, { name: "Patched" });

            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual(originalItem);
        });
    });

    describe("remove", () => {
        it("should call setQueryData with undefined", () => {
            const queryKey = ["test", "item"];
            const item: TestItem = { id: "1", name: "Test" };
            queryClient.setQueryData(queryKey, item);

            const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

            cacheUpdater.remove(queryKey);

            expect(setQueryDataSpy).toHaveBeenCalledWith(queryKey, undefined);
            setQueryDataSpy.mockRestore();
        });

        it("should save previous state before removing", () => {
            const queryKey = ["test", "item"];
            const item: TestItem = { id: "1", name: "Test" };
            queryClient.setQueryData(queryKey, item);

            cacheUpdater.remove(queryKey);

            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual(item);
        });
    });

    describe("revert", () => {
        it("should revert to previous state", () => {
            const queryKey = ["test", "item"];
            const originalItem: TestItem = { id: "1", name: "Original" };
            const newItem: TestItem = { id: "1", name: "New" };

            queryClient.setQueryData(queryKey, originalItem);
            cacheUpdater.set(queryKey, newItem);

            expect(queryClient.getQueryData(queryKey)).toEqual(newItem);

            cacheUpdater.revert();

            expect(queryClient.getQueryData(queryKey)).toEqual(originalItem);
        });

        it("should clear previous state after reverting", () => {
            const queryKey = ["test", "item"];
            const item: TestItem = { id: "1", name: "Test" };
            queryClient.setQueryData(queryKey, item);

            cacheUpdater.set(queryKey, { id: "1", name: "New" });
            cacheUpdater.revert();

            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual(item);
        });

        it("should do nothing if there is no previous state", () => {
            const queryKey = ["test", "item"];
            const item: TestItem = { id: "1", name: "Test" };
            queryClient.setQueryData(queryKey, item);

            cacheUpdater.revert();

            expect(queryClient.getQueryData(queryKey)).toEqual(item);
        });

        it("should work with different query keys", () => {
            const queryKey1 = ["test", "item1"];
            const queryKey2 = ["test", "item2"];
            const item1: TestItem = { id: "1", name: "Item 1" };
            const item2: TestItem = { id: "2", name: "Item 2" };

            queryClient.setQueryData(queryKey1, item1);
            queryClient.setQueryData(queryKey2, item2);

            cacheUpdater.set(queryKey1, { id: "1", name: "Updated 1" });
            cacheUpdater.set(queryKey2, { id: "2", name: "Updated 2" });

            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey2)).toEqual(item2);
            expect(queryClient.getQueryData(queryKey1)).toEqual({
                id: "1",
                name: "Updated 1",
            });
        });
    });

    describe("deep cloning", () => {
        it("should create deep copy of previous state", () => {
            const queryKey = ["test", "item"];
            const originalItem: TestItem = { id: "1", name: "Original" };
            queryClient.setQueryData(queryKey, originalItem);

            cacheUpdater.set(queryKey, { id: "1", name: "New" });

            originalItem.name = "Modified";

            cacheUpdater.revert();
            expect(queryClient.getQueryData(queryKey)).toEqual({
                id: "1",
                name: "Original",
            });
        });
    });

    describe("type tests", () => {
        it("should preserve generic type in set method", () => {
            const updater = createCacheUpdater<TestItem>(queryClient);
            const item: TestItem = { id: "1", name: "Test" };
            updater.set(["test"], item);
            expectTypeOf(updater.set).parameter(1).toEqualTypeOf<TestItem>();
        });

        it("should preserve generic type in update method", () => {
            const updater = createCacheUpdater<TestItem>(queryClient);
            updater.update(["test"], item => {
                expectTypeOf(item).toEqualTypeOf<TestItem>();
                return item;
            });
        });

        it("should accept Partial<TItem> in patch method", () => {
            const updater = createCacheUpdater<TestItem>(queryClient);
            const partial: Partial<TestItem> = { name: "Updated" };
            updater.patch(["test"], partial);
            expectTypeOf(updater.patch)
                .parameter(1)
                .toEqualTypeOf<Partial<TestItem>>();
        });

        it("should work with different item types", () => {
            type User = { id: number; name: string };
            const userUpdater = createCacheUpdater<User>(queryClient);
            const user: User = { id: 1, name: "John" };
            userUpdater.set(["user"], user);
            expectTypeOf(userUpdater.set).parameter(1).toEqualTypeOf<User>();
        });
    });
});

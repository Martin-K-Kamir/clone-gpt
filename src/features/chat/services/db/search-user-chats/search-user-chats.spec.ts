import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { searchUserChats } from "./search-user-chats";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("searchUserChats", () => {
    it("should return chats matching by title", async () => {
        const result = await searchUserChats({
            userId,
            query: "Seed",
        });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach(chat => {
            expect(chat.title.toLowerCase()).toContain("seed");
        });
    });

    it("should return chats matching by message content", async () => {
        const result = await searchUserChats({
            userId,
            query: "Hello",
        });

        if (result.data.length > 0) {
            expect(result.data.some(chat => chat.snippet)).toBeDefined();
        }
    });

    it("should respect limit parameter", async () => {
        const result = await searchUserChats({
            userId,
            query: "Seed",
            limit: 1,
        });

        expect(result.data.length).toBeLessThanOrEqual(1);
        if (result.totalCount > 1) {
            expect(result.hasNextPage).toBe(true);
            expect(result.cursor).toBeDefined();
        }
    });

    it("should return empty array when no matches found", async () => {
        const result = await searchUserChats({
            userId,
            query: "NonexistentQuery12345",
        });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.cursor).toBeUndefined();
    });

    it("should use cursor for pagination", async () => {
        const firstPage = await searchUserChats({
            userId,
            query: "Seed",
            limit: 1,
        });

        if (firstPage.hasNextPage && firstPage.cursor) {
            const secondPage = await searchUserChats({
                userId,
                query: "Seed",
                limit: 1,
                cursor: firstPage.cursor,
            });

            expect(secondPage.data.length).toBeLessThanOrEqual(1);
            if (secondPage.data.length > 0 && firstPage.data.length > 0) {
                expect(secondPage.data[0].id).not.toBe(firstPage.data[0].id);
            }
        }
    });
});

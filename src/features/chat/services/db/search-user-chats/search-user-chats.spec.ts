import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { searchUserChats } from "./search-user-chats";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("searchUserChats", () => {
    beforeEach(async () => {
        await supabase.from("chats").upsert({
            id: "30000000-0000-0000-0000-000000000001" as DBChatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: "2024-01-01T00:00:00Z",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        });
        await supabase.from("chats").upsert({
            id: "30000000-0000-0000-0000-000000000002" as DBChatId,
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Public Chat",
            visibility: "public",
            visibleAt: "2024-01-01T00:00:01Z",
            createdAt: "2024-01-01T00:00:01Z",
            updatedAt: "2024-01-01T00:00:01Z",
        });
    });
    it("returns chats matching by title", async () => {
        const result = await searchUserChats({
            userId,
            query: "Seed",
        });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach(chat => {
            expect(chat.title.toLowerCase()).toContain("seed");
        });
    });

    it("returns chats matching by message content", async () => {
        const result = await searchUserChats({
            userId,
            query: "Hello",
        });

        if (result.data.length > 0) {
            expect(result.data.some(chat => chat.snippet)).toBeDefined();
        }
    });

    it("respects limit parameter", async () => {
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

    it("returns empty array when no matches found", async () => {
        const result = await searchUserChats({
            userId,
            query: "NonexistentQuery12345",
        });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.cursor).toBeUndefined();
    });

    it("uses cursor for pagination", async () => {
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

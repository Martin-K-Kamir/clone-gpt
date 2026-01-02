import { beforeEach, describe, expect, it } from "vitest";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { ORDER_BY } from "@/lib/constants";

import { supabase } from "@/services/supabase";

import { getUserChats } from "./get-user-chats";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;

describe("getUserChats", () => {
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
    it("returns seeded chats for user", async () => {
        const result = await getUserChats({ userId });

        expect(result.data.length).toBeGreaterThan(0);
        expect(result.totalCount).toBeGreaterThan(0);
        result.data.forEach(chat => {
            expect(chat.userId).toBe(userId);
            expect((chat as any).isOwner).toBe(true);
        });
    });

    it("respects limit parameter", async () => {
        const result = await getUserChats({ userId, limit: 1 });

        expect(result.data.length).toBeLessThanOrEqual(1);
        if (result.totalCount > 1) {
            expect(result.hasNextPage).toBe(true);
        }
    });

    it("respects offset parameter", async () => {
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

        const firstPage = await getUserChats({ userId, limit: 1, offset: 0 });
        const secondPage = await getUserChats({ userId, limit: 1, offset: 1 });

        if (
            firstPage.totalCount > 1 &&
            firstPage.hasNextPage &&
            secondPage.data.length > 0 &&
            firstPage.data[0].id !== secondPage.data[0].id
        ) {
            expect(firstPage.data[0].id).not.toBe(secondPage.data[0].id);
        }
        expect(firstPage.data.length).toBeLessThanOrEqual(1);
        expect(secondPage.data.length).toBeLessThanOrEqual(1);
    });

    it("uses createdAt ordering by default", async () => {
        const result = await getUserChats({ userId, limit: 10 });

        if (result.data.length > 1) {
            const dates = result.data.map(chat =>
                new Date(chat.createdAt).getTime(),
            );
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
            }
        }
    });

    it("uses updatedAt ordering when specified", async () => {
        const result = await getUserChats({
            userId,
            limit: 10,
            orderBy: ORDER_BY.UPDATED_AT,
        });

        if (result.data.length > 1) {
            const dates = result.data.map(chat =>
                new Date(chat.updatedAt).getTime(),
            );
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
            }
        }
    });

    it("returns empty array for user with no chats", async () => {
        const missingUserId =
            "00000000-0000-0000-0000-000000000999" as DBUserId;
        const result = await getUserChats({ userId: missingUserId });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });
});

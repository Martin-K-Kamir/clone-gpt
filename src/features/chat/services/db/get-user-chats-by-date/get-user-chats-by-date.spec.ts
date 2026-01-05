import { describe, expect, it } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { ORDER_BY } from "@/lib/constants";

import { getUserChatsByDate } from "./get-user-chats-by-date";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserChatsByDate", () => {
    it("should return seeded chats for user", async () => {
        const result = await getUserChatsByDate({ userId });

        expect(result.length).toBeGreaterThan(0);
        result.forEach(chat => {
            expect(chat.userId).toBe(userId);
        });
    });

    it("should filter chats by date range", async () => {
        const from = new Date("2000-01-01");
        const to = new Date("2100-12-31");
        const result = await getUserChatsByDate({ userId, from, to });

        expect(result.length).toBeGreaterThan(0);
        result.forEach(chat => {
            const createdAt = new Date(chat.createdAt);
            expect(createdAt.getTime()).toBeGreaterThanOrEqual(from.getTime());
            expect(createdAt.getTime()).toBeLessThanOrEqual(to.getTime());
        });
    });

    it("should respect limit parameter", async () => {
        const result = await getUserChatsByDate({ userId, limit: 1 });

        expect(result.length).toBeLessThanOrEqual(1);
    });

    it("should use createdAt ordering by default", async () => {
        const result = await getUserChatsByDate({ userId, limit: 10 });

        if (result.length > 1) {
            const dates = result.map(chat =>
                new Date(chat.createdAt).getTime(),
            );
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
            }
        }
    });

    it("should use updatedAt ordering when specified", async () => {
        const result = await getUserChatsByDate({
            userId,
            limit: 10,
            orderBy: ORDER_BY.UPDATED_AT,
        });

        if (result.length > 1) {
            const dates = result.map(chat =>
                new Date(chat.updatedAt).getTime(),
            );
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
            }
        }
    });

    it("should filter by date range when from is provided", async () => {
        const from = new Date();
        from.setDate(from.getDate() - 365);
        const result = await getUserChatsByDate({ userId, from });

        result.forEach(chat => {
            const createdAt = new Date(chat.createdAt);
            expect(createdAt.getTime()).toBeGreaterThanOrEqual(from.getTime());
        });
    });

    it("should filter by date range when to is provided", async () => {
        const to = new Date();
        to.setDate(to.getDate() + 365);
        const result = await getUserChatsByDate({ userId, to });

        result.forEach(chat => {
            const createdAt = new Date(chat.createdAt);
            expect(createdAt.getTime()).toBeLessThanOrEqual(to.getTime());
        });
    });

    it("should return empty array for user with no chats in date range", async () => {
        const from = new Date("2100-01-01");
        const to = new Date("2100-12-31");
        const result = await getUserChatsByDate({ userId, from, to });

        expect(result).toHaveLength(0);
    });

    it("should return empty array for user with no chats", async () => {
        const result = await getUserChatsByDate({ userId: missingUserId });

        expect(result).toHaveLength(0);
    });
});

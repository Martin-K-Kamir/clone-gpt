import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserSharedChats } from "./get-user-shared-chats";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const missingUserId = "00000000-0000-0000-0000-000000000999" as DBUserId;

describe("getUserSharedChats", () => {
    it("should return seeded public chats for user", async () => {
        const result = await getUserSharedChats({ userId });

        expect(result.data.length).toBeGreaterThan(0);
        result.data.forEach(chat => {
            expect(chat.userId).toBe(userId);
            expect(chat.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        });
    });

    it("should return only public chats", async () => {
        const result = await getUserSharedChats({ userId });

        result.data.forEach(chat => {
            expect(chat.visibility).toBe(CHAT_VISIBILITY.PUBLIC);
        });
    });

    it("should return chats sorted by visibleAt descending", async () => {
        const result = await getUserSharedChats({ userId });

        if (result.data.length > 1) {
            const dates = result.data.map(chat =>
                new Date(chat.visibleAt).getTime(),
            );
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
            }
        }
    });

    it("should respect limit parameter", async () => {
        const result = await getUserSharedChats({ userId, limit: 1 });

        expect(result.data.length).toBeLessThanOrEqual(1);
        if (result.totalCount > 1) {
            expect(result.hasNextPage).toBe(true);
        }
    });

    it("should respect offset parameter", async () => {
        const firstPage = await getUserSharedChats({
            userId,
            limit: 1,
            offset: 0,
        });
        const secondPage = await getUserSharedChats({
            userId,
            limit: 1,
            offset: 1,
        });

        if (firstPage.hasNextPage && secondPage.data.length > 0) {
            expect(firstPage.data[0].id).not.toBe(secondPage.data[0].id);
        }
    });

    it("should calculate hasNextPage correctly", async () => {
        const result = await getUserSharedChats({ userId, limit: 1 });

        if (result.totalCount > 1) {
            expect(result.hasNextPage).toBe(true);
            expect(result.nextOffset).toBe(1);
        } else {
            expect(result.hasNextPage).toBe(false);
            expect(result.nextOffset).toBeUndefined();
        }
    });

    it("should return empty array for user with no public chats", async () => {
        const result = await getUserSharedChats({ userId: missingUserId });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });

    it("should filter out private chats", async () => {
        const result = await getUserSharedChats({ userId });

        result.data.forEach(chat => {
            expect(chat.visibility).not.toBe(CHAT_VISIBILITY.PRIVATE);
        });
    });
});

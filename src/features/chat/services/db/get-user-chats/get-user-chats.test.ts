import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import type { DBUserId } from "@/features/user/lib/types";

import { ORDER_BY } from "@/lib/constants";

import { getUserChats } from "./get-user-chats";

const userId = generateUserId();

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getUserChats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            getUserChats({ userId: "not-a-uuid" as DBUserId }),
        ).rejects.toThrow();
    });

    it("should throw when offset is invalid", async () => {
        await expect(
            getUserChats({ userId, offset: "not-a-number" as any }),
        ).rejects.toThrow();
    });

    it("should throw when limit is invalid", async () => {
        await expect(
            getUserChats({ userId, limit: "not-a-number" as any }),
        ).rejects.toThrow();
    });

    it("should return paginated chats on success", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-02T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-02T00:00:00Z",
            },
        ];

        mocks.from.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({
                            data: mockChats,
                            error: null,
                            count: 2,
                        }),
                    }),
                }),
            }),
        }));

        const result = await getUserChats({ userId });

        expect(result.data).toHaveLength(2);
        expect((result.data[0] as any)?.isOwner).toBe(true);
        expect((result.data[1] as any)?.isOwner).toBe(true);
        expect(result.totalCount).toBe(2);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });

    it("should calculate hasNextPage correctly", async () => {
        const mockChats = [{ id: "chat-1", userId, title: "Chat 1" }];

        mocks.from.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({
                            data: mockChats,
                            error: null,
                            count: 5,
                        }),
                    }),
                }),
            }),
        }));

        const result = await getUserChats({ userId, offset: 0, limit: 1 });

        expect(result.totalCount).toBe(5);
        expect(result.hasNextPage).toBe(true);
        expect(result.nextOffset).toBe(1);
    });

    it("should handle empty results", async () => {
        mocks.from.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({
                            data: [],
                            error: null,
                            count: 0,
                        }),
                    }),
                }),
            }),
        }));

        const result = await getUserChats({ userId });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });

    it("should return paginated chats with custom orderBy", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Chat 1",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Chat 2",
                visibility: CHAT_VISIBILITY.PRIVATE,
                createdAt: "2024-01-02T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                visibleAt: "2024-01-02T00:00:00Z",
            },
        ];

        mocks.from.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({
                            data: mockChats,
                            error: null,
                            count: 2,
                        }),
                    }),
                }),
            }),
        }));

        const result = await getUserChats({
            userId,
            orderBy: ORDER_BY.UPDATED_AT,
        });

        expect(result.data).toHaveLength(2);
        expect(result.totalCount).toBe(2);
        expect(result.hasNextPage).toBe(false);
    });

    it("should throw when fetch fails", async () => {
        mocks.from.mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "fail" },
                            count: null,
                        }),
                    }),
                }),
            }),
        }));

        await expect(getUserChats({ userId })).rejects.toThrow(
            "Failed to fetch user chats",
        );
    });
});

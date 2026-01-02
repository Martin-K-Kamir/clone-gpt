import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { ORDER_BY } from "@/lib/constants";

import { getUserChats } from "./get-user-chats";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

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

    it("throws when userId is invalid", async () => {
        await expect(
            getUserChats({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("throws when offset is invalid", async () => {
        await expect(
            getUserChats({ userId, offset: "not-a-number" as any }),
        ).rejects.toThrow();
    });

    it("throws when limit is invalid", async () => {
        await expect(
            getUserChats({ userId, limit: "not-a-number" as any }),
        ).rejects.toThrow();
    });

    it("returns paginated chats on success", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Chat 1",
                visibility: "private",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Chat 2",
                visibility: "private",
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
        expect((result.data[0] as any).isOwner).toBe(true);
        expect((result.data[1] as any).isOwner).toBe(true);
        expect(result.totalCount).toBe(2);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });

    it("calculates hasNextPage correctly", async () => {
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

    it("handles empty results", async () => {
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

    it("returns paginated chats with custom orderBy", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Chat 1",
                visibility: "private",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-03T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Chat 2",
                visibility: "private",
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

    it("throws on supabase error", async () => {
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

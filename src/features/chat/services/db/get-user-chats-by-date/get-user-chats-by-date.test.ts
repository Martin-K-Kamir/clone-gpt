import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { ORDER_BY } from "@/lib/constants";

import { getUserChatsByDate } from "./get-user-chats-by-date";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getUserChatsByDate", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            getUserChatsByDate({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("throws when limit is invalid", async () => {
        await expect(
            getUserChatsByDate({
                userId,
                limit: "not-a-number" as any,
            }),
        ).rejects.toThrow();
    });

    it("throws when from is invalid", async () => {
        await expect(
            getUserChatsByDate({
                userId,
                from: "not-a-date" as any,
            }),
        ).rejects.toThrow();
    });

    it("throws when to is invalid", async () => {
        await expect(
            getUserChatsByDate({
                userId,
                to: "not-a-date" as any,
            }),
        ).rejects.toThrow();
    });

    it("returns chats filtered by date range", async () => {
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

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: mockChats,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        const from = new Date("2024-01-01");
        const to = new Date("2024-01-31");
        const result = await getUserChatsByDate({ userId, from, to });

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("chat-1");
        expect(result[1].id).toBe("chat-2");
    });

    it("returns chats with default to date when not provided", async () => {
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
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: mockChats,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        const from = new Date("2024-01-01");
        const result = await getUserChatsByDate({ userId, from });

        expect(result).toHaveLength(1);
    });

    it("returns chats with default from date when not provided", async () => {
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
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: mockChats,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        const to = new Date("2024-01-31");
        const result = await getUserChatsByDate({ userId, to });

        expect(result).toHaveLength(1);
    });

    it("respects limit parameter", async () => {
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
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: mockChats,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await getUserChatsByDate({ userId, limit: 1 });

        expect(result).toHaveLength(1);
    });

    it("uses custom orderBy parameter", async () => {
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
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: mockChats,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await getUserChatsByDate({
            userId,
            orderBy: ORDER_BY.UPDATED_AT,
        });

        expect(result).toHaveLength(1);
    });

    it("handles empty results", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await getUserChatsByDate({ userId });

        expect(result).toHaveLength(0);
    });

    it("throws on supabase error", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            gte: vi.fn().mockReturnValue({
                                lte: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: "fail" },
                                }),
                            }),
                        }),
                    }),
                }),
            }),
        });

        await expect(getUserChatsByDate({ userId })).rejects.toThrow(
            "Failed to fetch chats by date",
        );
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserSharedChats } from "./get-user-shared-chats";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("getUserSharedChats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should throw when userId is invalid", async () => {
        await expect(
            getUserSharedChats({ userId: "not-a-uuid" as any }),
        ).rejects.toThrow();
    });

    it("should throw when offset is invalid", async () => {
        await expect(
            getUserSharedChats({
                userId,
                offset: "not-a-number" as any,
            }),
        ).rejects.toThrow();
    });

    it("should throw when limit is invalid", async () => {
        await expect(
            getUserSharedChats({
                userId,
                limit: "not-a-number" as any,
            }),
        ).rejects.toThrow();
    });

    it("should return paginated public chats for user", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Public Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-02T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Public Chat 2",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-01T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
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
            }),
        });

        const result = await getUserSharedChats({ userId });

        expect(result.data).toHaveLength(2);
        expect(result.totalCount).toBe(2);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });

    it("should calculate hasNextPage correctly", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Public Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-01T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
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
            }),
        });

        const result = await getUserSharedChats({
            userId,
            offset: 0,
            limit: 1,
        });

        expect(result.totalCount).toBe(5);
        expect(result.hasNextPage).toBe(true);
        expect(result.nextOffset).toBe(1);
    });

    it("should sort results by visibleAt descending", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Public Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-01T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Public Chat 2",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-02T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
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
            }),
        });

        const result = await getUserSharedChats({ userId });

        expect(result.data).toHaveLength(2);
        const dates = result.data.map(chat =>
            new Date(chat.visibleAt).getTime(),
        );
        expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
    });

    it("should handle negative offset by setting it to 0", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Public Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-01T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({
                                data: mockChats,
                                error: null,
                                count: 1,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await getUserSharedChats({ userId, offset: -5 });

        expect(result.data).toHaveLength(1);
    });

    it("should handle zero or negative limit by setting it to 1", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Public Chat 1",
                visibility: CHAT_VISIBILITY.PUBLIC,
                visibleAt: "2024-01-01T00:00:00Z",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
        ];

        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({
                                data: mockChats,
                                error: null,
                                count: 1,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const result = await getUserSharedChats({ userId, limit: 0 });

        expect(result.data).toHaveLength(1);
    });

    it("should handle empty results", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
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
            }),
        });

        const result = await getUserSharedChats({ userId });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.nextOffset).toBeUndefined();
    });

    it("should throw when fetch fails", async () => {
        mocks.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
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
            }),
        });

        await expect(getUserSharedChats({ userId })).rejects.toThrow(
            "Failed to fetch shared chats",
        );
    });
});

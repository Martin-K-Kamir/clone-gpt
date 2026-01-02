import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { searchUserChats } from "./search-user-chats";

const userId = "00000000-0000-0000-0000-000000000abc" as DBUserId;
const query = "test";

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        from: mocks.from,
    },
}));

describe("searchUserChats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws when userId is invalid", async () => {
        await expect(
            searchUserChats({ userId: "not-a-uuid" as any, query }),
        ).rejects.toThrow();
    });

    it("throws when query is empty", async () => {
        await expect(searchUserChats({ userId, query: "" })).rejects.toThrow();
    });

    it("throws when limit is invalid", async () => {
        await expect(
            searchUserChats({ userId, query, limit: "not-a-number" as any }),
        ).rejects.toThrow();
    });

    it("returns chats matching by title", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Test Chat",
                visibility: "private",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
        ];

        const calls: any[] = [];
        mocks.from.mockImplementation(() => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockReturnThis(),
                or: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({
                    data: calls.length === 0 ? [] : mockChats,
                    error: null,
                }),
            };
            calls.push(mockChain);
            return mockChain;
        });

        const result = await searchUserChats({ userId, query });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("chat-1");
        expect(result.hasNextPage).toBe(false);
        expect(result.cursor).toBeUndefined();
    });

    it("returns chats matching by message content", async () => {
        const mockMessages = [{ chatId: "chat-1", content: "test message" }];
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

        const calls: any[] = [];
        mocks.from.mockImplementation(() => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockResolvedValue({
                    data: calls.length === 0 ? mockMessages : null,
                    error: null,
                }),
                or: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({
                    data: calls.length === 1 ? mockChats : null,
                    error: null,
                }),
            };
            calls.push(mockChain);
            return mockChain;
        });

        const result = await searchUserChats({ userId, query });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("chat-1");
    });

    it("respects limit parameter", async () => {
        const mockChats = [
            {
                id: "chat-1",
                userId,
                title: "Test Chat 1",
                visibility: "private",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
            },
            {
                id: "chat-2",
                userId,
                title: "Test Chat 2",
                visibility: "private",
                createdAt: "2024-01-02T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-02T00:00:00Z",
            },
        ];

        const calls: any[] = [];
        mocks.from.mockImplementation(() => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockResolvedValue({
                    data: calls.length === 0 ? [] : null,
                    error: null,
                }),
                or: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({
                    data: calls.length === 1 ? mockChats : null,
                    error: null,
                }),
            };
            calls.push(mockChain);
            return mockChain;
        });

        const result = await searchUserChats({ userId, query, limit: 1 });

        expect(result.data).toHaveLength(1);
        expect(result.hasNextPage).toBe(true);
        expect(result.cursor).toBeDefined();
    });

    it("returns empty array when no matches found", async () => {
        const calls: any[] = [];
        mocks.from.mockImplementation(() => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockResolvedValue({
                    data: calls.length === 0 ? [] : null,
                    error: null,
                }),
                or: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({
                    data: calls.length === 1 ? [] : null,
                    error: null,
                }),
            };
            calls.push(mockChain);
            return mockChain;
        });

        const result = await searchUserChats({ userId, query });

        expect(result.data).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.hasNextPage).toBe(false);
        expect(result.cursor).toBeUndefined();
    });

    it("throws on message query error", async () => {
        const calls: any[] = [];
        mocks.from.mockImplementation(() => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: "message query error" },
                }),
                or: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
            };
            calls.push(mockChain);
            return mockChain;
        });

        await expect(searchUserChats({ userId, query })).rejects.toThrow(
            "Failed to query message chat IDs",
        );
    });

    it("throws on chat query error", async () => {
        const calls: any[] = [];
        mocks.from.mockImplementation(() => {
            const mockChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                ilike: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
                or: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: "chat query error" },
                }),
            };
            calls.push(mockChain);
            return mockChain;
        });

        await expect(searchUserChats({ userId, query })).rejects.toThrow(
            "Failed to query chats",
        );
    });
});

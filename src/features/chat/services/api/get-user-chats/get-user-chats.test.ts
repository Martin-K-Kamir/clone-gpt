import { server } from "@/vitest.setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { DBChat, DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { getUserChats } from "./get-user-chats";

describe("getUserChats", () => {
    it("should return paginated chat data when API returns success without params", async () => {
        const mockChats: DBChat[] = [
            {
                id: "chat-1" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Chat 1",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
                visibility: "private",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockChats,
                hasNextPage: false,
                totalCount: 1,
            },
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChats({});

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: false,
            totalCount: 1,
        });
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("chat-1");
        expect(result.data[0].title).toBe("Chat 1");
    });

    it("should return paginated chat data with offset and limit", async () => {
        const mockChats: DBChat[] = [
            {
                id: "chat-2" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Chat 2",
                createdAt: "2024-01-03T00:00:00Z",
                updatedAt: "2024-01-04T00:00:00Z",
                visibleAt: "2024-01-03T00:00:00Z",
                visibility: "private",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockChats,
                hasNextPage: true,
                nextOffset: 20,
                totalCount: 45,
            },
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (
                    url.searchParams.get("offset") === "0" &&
                    url.searchParams.get("limit") === "20"
                ) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChats({ offset: 0, limit: 20 });

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: true,
            nextOffset: 20,
            totalCount: 45,
        });
        expect(result.hasNextPage).toBe(true);
        expect(result.nextOffset).toBe(20);
        expect(result.totalCount).toBe(45);
    });

    it("should return paginated chat data with orderBy", async () => {
        const mockChats: DBChat[] = [
            {
                id: "chat-3" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Chat 3",
                createdAt: "2024-01-05T00:00:00Z",
                updatedAt: "2024-01-06T00:00:00Z",
                visibleAt: "2024-01-05T00:00:00Z",
                visibility: "public",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockChats,
                hasNextPage: false,
                totalCount: 1,
            },
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("orderBy") === "updatedAt") {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChats({ orderBy: "updatedAt" });

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: false,
            totalCount: 1,
        });
        expect(result.data[0].visibility).toBe("public");
    });

    it("should return paginated chat data with all params", async () => {
        const mockChats: DBChat[] = [
            {
                id: "chat-4" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Chat 4",
                createdAt: "2024-01-07T00:00:00Z",
                updatedAt: "2024-01-08T00:00:00Z",
                visibleAt: "2024-01-07T00:00:00Z",
                visibility: "private",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockChats,
                hasNextPage: true,
                nextOffset: 40,
                totalCount: 100,
            },
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (
                    url.searchParams.get("offset") === "20" &&
                    url.searchParams.get("limit") === "20" &&
                    url.searchParams.get("orderBy") === "createdAt"
                ) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChats({
            offset: 20,
            limit: 20,
            orderBy: "createdAt",
        });

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: true,
            nextOffset: 40,
            totalCount: 100,
        });
    });

    it("should return empty array when no chats found", async () => {
        const mockResponse = {
            success: true,
            data: {
                data: [],
                hasNextPage: false,
                totalCount: 0,
            },
            message: "Successfully retrieved 0 chats",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserChats({});

        expect(result).toEqual({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        });
        expect(result.data).toHaveLength(0);
    });

    it("should throw error when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(getUserChats({})).rejects.toThrow(
            "Failed to fetch user chats",
        );
    });

    it("should throw error when API returns 404 not found", async () => {
        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.json(
                    { error: "Not found" },
                    { status: 404 },
                );
            }),
        );

        await expect(getUserChats({})).rejects.toThrow(
            "Failed to fetch user chats",
        );
    });

    it("should throw error when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Failed to fetch chats",
            status: 500,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(getUserChats({})).rejects.toThrow("Failed to fetch chats");
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.error();
            }),
        );

        await expect(getUserChats({})).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user-chats", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(getUserChats({})).rejects.toThrow(
            "Failed to fetch user chats",
        );
    });
});

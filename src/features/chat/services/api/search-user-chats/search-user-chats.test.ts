import { server } from "@/vitest.setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { DBChatId, DBChatSearchResult } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { searchUserChats } from "./search-user-chats";

describe("searchUserChats", () => {
    it("should return search results when API returns success with query only", async () => {
        const mockSearchResults: DBChatSearchResult[] = [
            {
                id: "chat-1" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Test Chat",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
                visibility: "private",
                snippet: "This is a test chat snippet",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockSearchResults,
                hasNextPage: false,
            },
            message: "Successfully searched chats",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/search",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("query") === "test" &&
                        url.searchParams.get("cursorDate") === null &&
                        url.searchParams.get("cursorId") === null &&
                        url.searchParams.get("limit") === null
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await searchUserChats({ query: "test" });

        expect(result).toEqual({
            data: mockSearchResults,
            hasNextPage: false,
        });
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("chat-1");
        expect(result.data[0].title).toBe("Test Chat");
        expect(result.data[0].snippet).toBe("This is a test chat snippet");
    });

    it("should return search results with query and limit", async () => {
        const mockSearchResults: DBChatSearchResult[] = [
            {
                id: "chat-2" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Another Chat",
                createdAt: "2024-01-03T00:00:00Z",
                updatedAt: "2024-01-04T00:00:00Z",
                visibleAt: "2024-01-03T00:00:00Z",
                visibility: "public",
                snippet: "Another chat snippet",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockSearchResults,
                hasNextPage: true,
                cursor: {
                    date: "2024-01-04T00:00:00Z",
                    id: "chat-2",
                },
            },
            message: "Successfully searched chats",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/search",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("query") === "another" &&
                        url.searchParams.get("limit") === "10"
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await searchUserChats({ query: "another", limit: 10 });

        expect(result).toEqual({
            data: mockSearchResults,
            hasNextPage: true,
            cursor: {
                date: "2024-01-04T00:00:00Z",
                id: "chat-2",
            },
        });
        expect(result.hasNextPage).toBe(true);
        expect(result.cursor).toBeDefined();
        expect(result.cursor?.date).toBe("2024-01-04T00:00:00Z");
        expect(result.cursor?.id).toBe("chat-2");
    });

    it("should return search results with query, cursor, and limit", async () => {
        const mockSearchResults: DBChatSearchResult[] = [
            {
                id: "chat-3" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Third Chat",
                createdAt: "2024-01-05T00:00:00Z",
                updatedAt: "2024-01-06T00:00:00Z",
                visibleAt: "2024-01-05T00:00:00Z",
                visibility: "private",
                snippet: "Third chat snippet",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockSearchResults,
                hasNextPage: false,
            },
            message: "Successfully searched chats",
            status: 200,
            timestamp: Date.now(),
        };

        const cursor = {
            date: "2024-01-04T00:00:00Z",
            id: "chat-2",
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/search",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("query") === "third" &&
                        url.searchParams.get("cursorDate") === cursor.date &&
                        url.searchParams.get("cursorId") === cursor.id &&
                        url.searchParams.get("limit") === "20"
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await searchUserChats({
            query: "third",
            cursor,
            limit: 20,
        });

        expect(result).toEqual({
            data: mockSearchResults,
            hasNextPage: false,
        });
    });

    it("should return search results with cursor only", async () => {
        const mockSearchResults: DBChatSearchResult[] = [
            {
                id: "chat-4" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Fourth Chat",
                createdAt: "2024-01-07T00:00:00Z",
                updatedAt: "2024-01-08T00:00:00Z",
                visibleAt: "2024-01-07T00:00:00Z",
                visibility: "public",
                snippet: "Fourth chat snippet",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockSearchResults,
                hasNextPage: true,
                cursor: {
                    date: "2024-01-08T00:00:00Z",
                    id: "chat-4",
                },
            },
            message: "Successfully searched chats",
            status: 200,
            timestamp: Date.now(),
        };

        const cursor = {
            date: "2024-01-06T00:00:00Z",
            id: "chat-3",
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/search",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("cursorDate") === cursor.date &&
                        url.searchParams.get("cursorId") === cursor.id &&
                        url.searchParams.get("query") === null &&
                        url.searchParams.get("limit") === null
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await searchUserChats({ cursor });

        expect(result).toEqual({
            data: mockSearchResults,
            hasNextPage: true,
            cursor: {
                date: "2024-01-08T00:00:00Z",
                id: "chat-4",
            },
        });
    });

    it("should return empty array when no search results found", async () => {
        const mockResponse = {
            success: true,
            data: {
                data: [],
                hasNextPage: false,
            },
            message: "Successfully searched chats",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/search",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (url.searchParams.get("query") === "nonexistent") {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await searchUserChats({ query: "nonexistent" });

        expect(result).toEqual({
            data: [],
            hasNextPage: false,
        });
        expect(result.data).toHaveLength(0);
    });

    it("should return multiple search results", async () => {
        const mockSearchResults: DBChatSearchResult[] = [
            {
                id: "chat-5" as DBChatId,
                userId: "user-123" as DBUserId,
                title: "Chat Five",
                createdAt: "2024-02-01T00:00:00Z",
                updatedAt: "2024-02-02T00:00:00Z",
                visibleAt: "2024-02-01T00:00:00Z",
                visibility: "private",
                snippet: "Chat five snippet",
            },
            {
                id: "chat-6" as DBChatId,
                userId: "user-456" as DBUserId,
                title: "Chat Six",
                createdAt: "2024-02-03T00:00:00Z",
                updatedAt: "2024-02-04T00:00:00Z",
                visibleAt: "2024-02-03T00:00:00Z",
                visibility: "public",
                snippet: "Chat six snippet",
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockSearchResults,
                hasNextPage: false,
            },
            message: "Successfully searched chats",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/search",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (url.searchParams.get("query") === "chat") {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await searchUserChats({ query: "chat" });

        expect(result).toEqual({
            data: mockSearchResults,
            hasNextPage: false,
        });
        expect(result.data).toHaveLength(2);
        expect(result.data[0].id).toBe("chat-5");
        expect(result.data[1].id).toBe("chat-6");
    });

    it("should throw error when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/search", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(searchUserChats({ query: "test" })).rejects.toThrow(
            "Failed to search user chats",
        );
    });

    it("should throw error when API returns 404 not found", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/search", () => {
                return HttpResponse.json(
                    { error: "Not found" },
                    { status: 404 },
                );
            }),
        );

        await expect(searchUserChats({ query: "test" })).rejects.toThrow(
            "Failed to search user chats",
        );
    });

    it("should throw error when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Failed to search chats",
            status: 500,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats/search", () => {
                return HttpResponse.json(mockErrorResponse, {
                    status: 200,
                });
            }),
        );

        await expect(searchUserChats({ query: "test" })).rejects.toThrow(
            "Failed to search chats",
        );
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/search", () => {
                return HttpResponse.error();
            }),
        );

        await expect(searchUserChats({ query: "test" })).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/search", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(searchUserChats({ query: "test" })).rejects.toThrow(
            "Failed to search user chats",
        );
    });
});

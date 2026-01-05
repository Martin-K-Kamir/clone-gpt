import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat } from "@/features/chat/lib/types";

import { getUserChatsByDate } from "./get-user-chats-by-date";

describe("getUserChatsByDate", () => {
    it("should return chat data array when API returns success with from date", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Chat 1",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
                visibility: CHAT_VISIBILITY.PRIVATE,
            },
        ];

        const mockResponse = {
            success: true,
            data: mockChats,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        const fromDate = new Date("2024-01-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChatsByDate({ from: fromDate });

        expect(result).toEqual(mockChats);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(chatId);
        expect(result[0].title).toBe("Chat 1");
    });

    it("should return chat data array with from and to dates", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Chat 2",
                createdAt: "2024-01-15T00:00:00Z",
                updatedAt: "2024-01-16T00:00:00Z",
                visibleAt: "2024-01-15T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
            },
        ];

        const mockResponse = {
            success: true,
            data: mockChats,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        const fromDate = new Date("2024-01-01T00:00:00Z");
        const toDate = new Date("2024-01-31T23:59:59Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (
                    url.searchParams.get("from") === fromDate.toISOString() &&
                    url.searchParams.get("to") === toDate.toISOString()
                ) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChatsByDate({
            from: fromDate,
            to: toDate,
        });

        expect(result).toEqual(mockChats);
        expect(result[0].visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should return chat data array with from, to, limit, and orderBy", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Chat 3",
                createdAt: "2024-02-01T00:00:00Z",
                updatedAt: "2024-02-02T00:00:00Z",
                visibleAt: "2024-02-01T00:00:00Z",
                visibility: CHAT_VISIBILITY.PRIVATE,
            },
        ];

        const mockResponse = {
            success: true,
            data: mockChats,
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        const fromDate = new Date("2024-02-01T00:00:00Z");
        const toDate = new Date("2024-02-28T23:59:59Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (
                    url.searchParams.get("from") === fromDate.toISOString() &&
                    url.searchParams.get("to") === toDate.toISOString() &&
                    url.searchParams.get("limit") === "20" &&
                    url.searchParams.get("orderBy") === "updatedAt"
                ) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChatsByDate({
            from: fromDate,
            to: toDate,
            limit: 20,
            orderBy: "updatedAt",
        });

        expect(result).toEqual(mockChats);
    });

    it("should return empty array when no chats found in date range", async () => {
        const mockResponse = {
            success: true,
            data: [],
            message: "Successfully retrieved 0 chats",
            status: 200,
            timestamp: Date.now(),
        };

        const fromDate = new Date("2024-03-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChatsByDate({ from: fromDate });

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
    });

    it("should return multiple chats when API returns multiple items", async () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId1,
                userId,
                title: "Chat 4",
                createdAt: "2024-04-01T00:00:00Z",
                updatedAt: "2024-04-02T00:00:00Z",
                visibleAt: "2024-04-01T00:00:00Z",
                visibility: CHAT_VISIBILITY.PRIVATE,
            },
            {
                id: chatId2,
                userId,
                title: "Chat 5",
                createdAt: "2024-04-02T00:00:00Z",
                updatedAt: "2024-04-03T00:00:00Z",
                visibleAt: "2024-04-02T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
            },
        ];

        const mockResponse = {
            success: true,
            data: mockChats,
            message: "Successfully retrieved 2 chats",
            status: 200,
            timestamp: Date.now(),
        };

        const fromDate = new Date("2024-04-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(mockResponse);
                }
            }),
        );

        const result = await getUserChatsByDate({ from: fromDate });

        expect(result).toEqual(mockChats);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(chatId1);
        expect(result[1].id).toBe(chatId2);
    });

    it("should throw error when API returns error response (not ok)", async () => {
        const fromDate = new Date("2024-01-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 },
                    );
                }
            }),
        );

        await expect(getUserChatsByDate({ from: fromDate })).rejects.toThrow(
            "Failed to fetch user chats by date",
        );
    });

    it("should throw error when API returns 404 not found", async () => {
        const fromDate = new Date("2024-01-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(
                        { error: "Not found" },
                        { status: 404 },
                    );
                }
            }),
        );

        await expect(getUserChatsByDate({ from: fromDate })).rejects.toThrow(
            "Failed to fetch user chats by date",
        );
    });

    it("should throw error when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Failed to fetch chats",
            status: 500,
            timestamp: Date.now(),
        };

        const fromDate = new Date("2024-01-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(mockErrorResponse, {
                        status: 200,
                    });
                }
            }),
        );

        await expect(getUserChatsByDate({ from: fromDate })).rejects.toThrow(
            "Failed to fetch chats",
        );
    });

    it("should throw error on network failure", async () => {
        const fromDate = new Date("2024-01-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.error();
                }
            }),
        );

        await expect(getUserChatsByDate({ from: fromDate })).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        const fromDate = new Date("2024-01-01T00:00:00Z");

        server.use(
            http.get("http://localhost/api/user-chats", ({ request }) => {
                const url = new URL(request.url);
                if (url.searchParams.get("from") === fromDate.toISOString()) {
                    return HttpResponse.json(
                        { error: "Internal server error" },
                        { status: 500 },
                    );
                }
            }),
        );

        await expect(getUserChatsByDate({ from: fromDate })).rejects.toThrow(
            "Failed to fetch user chats by date",
        );
    });
});

import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat } from "@/features/chat/lib/types";

import { getUserSharedChats } from "./get-user-shared-chats";

describe("getUserSharedChats", () => {
    it("should return paginated shared chat data when API returns success without params", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Shared Chat 1",
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-02T00:00:00Z",
                visibleAt: "2024-01-01T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
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
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserSharedChats({});

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: false,
            totalCount: 1,
        });
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(chatId);
        expect(result.data[0].title).toBe("Shared Chat 1");
        expect(result.data[0].visibility).toBe(CHAT_VISIBILITY.PUBLIC);
    });

    it("should return paginated shared chat data with offset and limit", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Shared Chat 2",
                createdAt: "2024-01-03T00:00:00Z",
                updatedAt: "2024-01-04T00:00:00Z",
                visibleAt: "2024-01-03T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
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
            http.get(
                "http://localhost/api/user-chats/shared",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("offset") === "0" &&
                        url.searchParams.get("limit") === "20"
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await getUserSharedChats({ offset: 0, limit: 20 });

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

    it("should return paginated shared chat data with offset only", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Shared Chat 3",
                createdAt: "2024-01-05T00:00:00Z",
                updatedAt: "2024-01-06T00:00:00Z",
                visibleAt: "2024-01-05T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
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
            http.get(
                "http://localhost/api/user-chats/shared",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("offset") === "10" &&
                        url.searchParams.get("limit") === null
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await getUserSharedChats({ offset: 10 });

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: false,
            totalCount: 1,
        });
    });

    it("should return paginated shared chat data with limit only", async () => {
        const chatId = generateChatId();
        const userId = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId,
                userId,
                title: "Shared Chat 4",
                createdAt: "2024-01-07T00:00:00Z",
                updatedAt: "2024-01-08T00:00:00Z",
                visibleAt: "2024-01-07T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockChats,
                hasNextPage: true,
                nextOffset: 30,
                totalCount: 50,
            },
            message: "Successfully retrieved 1 chat",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get(
                "http://localhost/api/user-chats/shared",
                ({ request }) => {
                    const url = new URL(request.url);
                    if (
                        url.searchParams.get("offset") === null &&
                        url.searchParams.get("limit") === "30"
                    ) {
                        return HttpResponse.json(mockResponse);
                    }
                },
            ),
        );

        const result = await getUserSharedChats({ limit: 30 });

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: true,
            nextOffset: 30,
            totalCount: 50,
        });
    });

    it("should return empty array when no shared chats found", async () => {
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
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserSharedChats({});

        expect(result).toEqual({
            data: [],
            hasNextPage: false,
            totalCount: 0,
        });
        expect(result.data).toHaveLength(0);
    });

    it("should return multiple shared chats", async () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const userId1 = generateUserId();
        const userId2 = generateUserId();
        const mockChats: DBChat[] = [
            {
                id: chatId1,
                userId: userId1,
                title: "Shared Chat 5",
                createdAt: "2024-02-01T00:00:00Z",
                updatedAt: "2024-02-02T00:00:00Z",
                visibleAt: "2024-02-01T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
            },
            {
                id: chatId2,
                userId: userId2,
                title: "Shared Chat 6",
                createdAt: "2024-02-03T00:00:00Z",
                updatedAt: "2024-02-04T00:00:00Z",
                visibleAt: "2024-02-03T00:00:00Z",
                visibility: CHAT_VISIBILITY.PUBLIC,
            },
        ];

        const mockResponse = {
            success: true,
            data: {
                data: mockChats,
                hasNextPage: false,
                totalCount: 2,
            },
            message: "Successfully retrieved 2 chats",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUserSharedChats({});

        expect(result).toEqual({
            data: mockChats,
            hasNextPage: false,
            totalCount: 2,
        });
        expect(result.data).toHaveLength(2);
        expect(result.data[0].id).toBe(chatId1);
        expect(result.data[1].id).toBe(chatId2);
    });

    it("should throw error when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(getUserSharedChats({})).rejects.toThrow(
            "Failed to fetch user shared chats",
        );
    });

    it("should throw error when API returns 404 not found", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(
                    { error: "Not found" },
                    { status: 404 },
                );
            }),
        );

        await expect(getUserSharedChats({})).rejects.toThrow(
            "Failed to fetch user shared chats",
        );
    });

    it("should throw error when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Failed to fetch shared chats",
            status: 500,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(mockErrorResponse, {
                    status: 200,
                });
            }),
        );

        await expect(getUserSharedChats({})).rejects.toThrow(
            "Failed to fetch shared chats",
        );
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.error();
            }),
        );

        await expect(getUserSharedChats({})).rejects.toThrow();
    });

    it("should throw error when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user-chats/shared", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(getUserSharedChats({})).rejects.toThrow(
            "Failed to fetch user shared chats",
        );
    });
});

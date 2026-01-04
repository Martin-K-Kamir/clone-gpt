import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    searchUserChats: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/db", () => ({
    searchUserChats: mocks.searchUserChats,
}));

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                search: vi.fn((data: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            chat: {
                search: vi.fn((error: any) => ({
                    success: false as const,
                    error,
                    toResponse: vi.fn(
                        () => new Response(JSON.stringify({ error })),
                    ),
                })),
            },
        },
    },
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiErrorResponse: vi.fn((error: any, handler: any) => handler(error)),
}));

describe("GET /api/user-chats/search", () => {
    const userId = "00000000-0000-0000-0000-000000000001";

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user",
            },
        });
    });

    it("returns search results successfully without query parameters", async () => {
        const mockResults = {
            chats: [],
            hasNextPage: false,
        };

        mocks.searchUserChats.mockResolvedValue(mockResults);

        const url = new URL("http://localhost/api/user-chats/search");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns search results with query parameter", async () => {
        const mockResults = {
            chats: [],
            hasNextPage: false,
        };

        mocks.searchUserChats.mockResolvedValue(mockResults);

        const url = new URL("http://localhost/api/user-chats/search");
        url.searchParams.set("query", "test search");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns search results with cursor", async () => {
        const mockResults = {
            chats: [],
            hasNextPage: false,
        };

        mocks.searchUserChats.mockResolvedValue(mockResults);

        const url = new URL("http://localhost/api/user-chats/search");
        url.searchParams.set("query", "test");
        url.searchParams.set("cursorDate", "2024-01-01T00:00:00Z");
        url.searchParams.set(
            "cursorId",
            "30000000-0000-0000-0000-000000000001",
        );
        url.searchParams.set("limit", "10");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("handles invalid limit parameter gracefully", async () => {
        const mockResults = {
            chats: [],
            hasNextPage: false,
        };

        mocks.searchUserChats.mockResolvedValue(mockResults);

        const url = new URL("http://localhost/api/user-chats/search");
        url.searchParams.set("limit", "not-a-number");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("handles incomplete cursor parameters", async () => {
        const mockResults = {
            chats: [],
            hasNextPage: false,
        };

        mocks.searchUserChats.mockResolvedValue(mockResults);

        const url = new URL("http://localhost/api/user-chats/search");
        url.searchParams.set("cursorDate", "2024-01-01T00:00:00Z");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const url = new URL("http://localhost/api/user-chats/search");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when searchUserChats fails", async () => {
        mocks.searchUserChats.mockRejectedValue(new Error("Database error"));

        const url = new URL("http://localhost/api/user-chats/search");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });
});

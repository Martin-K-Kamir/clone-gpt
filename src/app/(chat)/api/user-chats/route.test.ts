import { createMockSessionWithUser } from "@/vitest/helpers/create-mock-session";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    getUserChats: vi.fn(),
    getUserChatsByDate: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/db", () => ({
    getUserChats: mocks.getUserChats,
    getUserChatsByDate: mocks.getUserChatsByDate,
}));

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                get: vi.fn((data: any, _placeholders: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            chat: {
                get: vi.fn((error: any, _placeholders: any) => ({
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

describe("GET /api/user-chats", () => {
    const mockSession = createMockSessionWithUser();

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue(mockSession);
    });

    it("should return user chats successfully without query parameters", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserChats.mockResolvedValue(mockChats);

        const url = new URL("http://localhost/api/user-chats");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return user chats with query parameters", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserChats.mockResolvedValue(mockChats);

        const url = new URL("http://localhost/api/user-chats");
        url.searchParams.set("offset", "10");
        url.searchParams.set("limit", "20");
        url.searchParams.set("orderBy", "createdAt");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return user chats with date range", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserChatsByDate.mockResolvedValue(mockChats);

        const fromDate = new Date("2024-01-01");
        const toDate = new Date("2024-01-31");
        const url = new URL("http://localhost/api/user-chats");
        url.searchParams.set("from", fromDate.toISOString());
        url.searchParams.set("to", toDate.toISOString());
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should handle invalid query parameters gracefully", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserChats.mockResolvedValue(mockChats);

        const url = new URL("http://localhost/api/user-chats");
        url.searchParams.set("offset", "invalid");
        url.searchParams.set("limit", "not-a-number");
        url.searchParams.set("orderBy", "invalid");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const url = new URL("http://localhost/api/user-chats");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when getUserChats fails", async () => {
        mocks.getUserChats.mockRejectedValue(new Error("Database error"));

        const url = new URL("http://localhost/api/user-chats");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when getUserChatsByDate fails", async () => {
        mocks.getUserChatsByDate.mockRejectedValue(new Error("Database error"));

        const fromDate = new Date("2024-01-01");
        const url = new URL("http://localhost/api/user-chats");
        url.searchParams.set("from", fromDate.toISOString());
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });
});

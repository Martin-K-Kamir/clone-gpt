import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    getUserSharedChats: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/db", () => ({
    getUserSharedChats: mocks.getUserSharedChats,
}));

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            chat: {
                getShared: vi.fn((data: any, _placeholders: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            chat: {
                getShared: vi.fn((error: any, _placeholders: any) => ({
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

describe("GET /api/user-chats/shared", () => {
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

    it("returns shared chats successfully without query parameters", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserSharedChats.mockResolvedValue(mockChats);

        const url = new URL("http://localhost/api/user-chats/shared");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns shared chats with query parameters", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserSharedChats.mockResolvedValue(mockChats);

        const url = new URL("http://localhost/api/user-chats/shared");
        url.searchParams.set("offset", "10");
        url.searchParams.set("limit", "20");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("handles invalid query parameters gracefully", async () => {
        const mockChats = {
            chats: [],
            hasNextPage: false,
        };

        mocks.getUserSharedChats.mockResolvedValue(mockChats);

        const url = new URL("http://localhost/api/user-chats/shared");
        url.searchParams.set("offset", "invalid");
        url.searchParams.set("limit", "not-a-number");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const url = new URL("http://localhost/api/user-chats/shared");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when getUserSharedChats fails", async () => {
        mocks.getUserSharedChats.mockRejectedValue(new Error("Database error"));

        const url = new URL("http://localhost/api/user-chats/shared");
        const request = new NextRequest(url);

        const response = await GET(request);

        expect(response).toBeInstanceOf(Response);
    });
});

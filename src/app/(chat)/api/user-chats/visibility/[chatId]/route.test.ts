import { createMockSessionWithUser } from "@/vitest/helpers/create-mock-session";
import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    getChatVisibility: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/db", () => ({
    getChatVisibility: mocks.getChatVisibility,
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
                notFound: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ error: "Not found" }),
                            ),
                    ),
                })),
            },
            session: {
                authorization: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ error: "Unauthorized" }),
                            ),
                    ),
                })),
            },
        },
    },
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiErrorResponse: vi.fn((error: any, handler: any) => handler(error)),
}));

describe("GET /api/user-chats/visibility/[chatId]", () => {
    const userId = generateUserId();
    const otherUserId = generateUserId();
    const chatId = generateChatId();
    const mockSession = createMockSessionWithUser(userId);

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue(mockSession);
    });

    it("should return chat visibility successfully when user is owner", async () => {
        const mockVisibility = {
            userId,
            visibility: "private",
        };

        mocks.getChatVisibility.mockResolvedValue(mockVisibility);

        const request = new NextRequest(
            "http://localhost/api/user-chats/visibility/test",
        );
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return not found when chat does not exist", async () => {
        mocks.getChatVisibility.mockResolvedValue(null);

        const request = new NextRequest(
            "http://localhost/api/user-chats/visibility/test",
        );
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return authorization error when user is not owner", async () => {
        const mockVisibility = {
            userId: otherUserId,
            visibility: "private",
        };

        mocks.getChatVisibility.mockResolvedValue(mockVisibility);

        const request = new NextRequest(
            "http://localhost/api/user-chats/visibility/test",
        );
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const request = new NextRequest(
            "http://localhost/api/user-chats/visibility/test",
        );
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when getChatVisibility fails", async () => {
        mocks.getChatVisibility.mockRejectedValue(new Error("Database error"));

        const request = new NextRequest(
            "http://localhost/api/user-chats/visibility/test",
        );
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });
});

import { createMockSessionWithUser } from "@/vitest/helpers/create-mock-session";
import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    getUserChatById: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/db", () => ({
    getUserChatById: mocks.getUserChatById,
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
        },
    },
}));

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiErrorResponse: vi.fn((error: any, handler: any) => handler(error)),
}));

describe("GET /api/user-chats/[chatId]", () => {
    const mockSession = createMockSessionWithUser();
    const chatId = generateChatId();

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue(mockSession);
    });

    it("should return chat successfully", async () => {
        const mockChat = {
            id: chatId,
            userId: mockSession.user.id,
            title: "Test Chat",
            visibility: "private",
        };

        mocks.getUserChatById.mockResolvedValue(mockChat);

        const request = new NextRequest("http://localhost/api/user-chats/test");
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return not found when chat does not exist", async () => {
        mocks.getUserChatById.mockResolvedValue(null);

        const request = new NextRequest("http://localhost/api/user-chats/test");
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const request = new NextRequest("http://localhost/api/user-chats/test");
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when getUserChatById fails", async () => {
        mocks.getUserChatById.mockRejectedValue(new Error("Database error"));

        const request = new NextRequest("http://localhost/api/user-chats/test");
        const params = Promise.resolve({ chatId });

        const response = await GET(request, { params });

        expect(response).toBeInstanceOf(Response);
    });
});

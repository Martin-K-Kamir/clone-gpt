import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    getUserChatPreferences: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/user/services/db", () => ({
    getUserChatPreferences: mocks.getUserChatPreferences,
}));

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            user: {
                getChatPreferences: vi.fn((data: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            user: {
                getChatPreferences: vi.fn((error: any) => ({
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

describe("GET /api/user/chat-preferences", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns user chat preferences successfully", async () => {
        const userId = "00000000-0000-0000-0000-000000000001";
        const mockPreferences = {
            userId,
            personality: "FRIENDLY",
            nickname: "Test User",
        };

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user",
            },
        });

        mocks.getUserChatPreferences.mockResolvedValue(mockPreferences);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when getUserChatPreferences fails", async () => {
        const userId = "00000000-0000-0000-0000-000000000001";

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user",
            },
        });

        mocks.getUserChatPreferences.mockRejectedValue(
            new Error("Database error"),
        );

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });
});

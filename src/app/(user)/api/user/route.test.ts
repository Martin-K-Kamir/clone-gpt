import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

const { GET } = await import("./route");

const mocks = vi.hoisted(() => ({
    getUserById: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/user/services/db", () => ({
    getUserById: mocks.getUserById,
}));

const apiSuccess = { success: true as const };
const mockUser = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "test@example.com",
    name: "Test User",
    image: null,
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            user: {
                get: vi.fn((data: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ success: true, data }),
                            ),
                    ),
                })),
            },
        },
        error: {
            user: {
                notFound: vi.fn(() => ({
                    success: false as const,
                    toResponse: vi.fn(
                        () =>
                            new Response(JSON.stringify({ success: false }), {
                                status: 404,
                            }),
                    ),
                })),
                get: vi.fn((error: any) => ({
                    success: false as const,
                    error,
                    toResponse: vi.fn(
                        () =>
                            new Response(
                                JSON.stringify({ success: false, error }),
                                {
                                    status: 500,
                                },
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

describe("GET /api/user", () => {
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

    it("returns user on success", async () => {
        mocks.getUserById.mockResolvedValue(mockUser);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
        const data = await response.json();
        expect(data.success).toBe(true);
    });

    it("returns error when user not found", async () => {
        mocks.getUserById.mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when fetching user fails", async () => {
        mocks.getUserById.mockRejectedValue(new Error("Database error"));

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.success).toBe(false);
    });
});

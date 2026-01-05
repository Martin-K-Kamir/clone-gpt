import { createMockSessionWithUser } from "@/vitest/helpers/create-mock-session";
import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

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
    const userId = generateUserId();
    const mockSession = createMockSessionWithUser(userId);
    const mockUser = {
        id: userId,
        email: mockSession.user.email,
        name: mockSession.user.name,
        image: null,
        role: mockSession.user.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue(mockSession);
    });

    it("should return user on success", async () => {
        mocks.getUserById.mockResolvedValue(mockUser);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
        const data = await response.json();
        expect(data.success).toBe(true);
    });

    it("should return error when user not found", async () => {
        mocks.getUserById.mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
    });

    it("should return error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when fetching user fails", async () => {
        mocks.getUserById.mockRejectedValue(new Error("Database error"));

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.success).toBe(false);
    });
});

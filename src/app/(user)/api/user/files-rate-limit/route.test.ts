import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    checkUserFilesRateLimit: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/user/services/db", () => ({
    checkUserFilesRateLimit: mocks.checkUserFilesRateLimit,
}));

const apiSuccess = { success: true as const };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            user: {
                checkRateLimit: vi.fn((data: any) => ({
                    ...apiSuccess,
                    data,
                    toResponse: vi.fn(() => new Response(JSON.stringify(data))),
                })),
            },
        },
        error: {
            user: {
                checkRateLimit: vi.fn((error: any) => ({
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

describe("GET /api/user/files-rate-limit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns files rate limit successfully", async () => {
        const userId = "00000000-0000-0000-0000-000000000001";
        const mockRateLimit = {
            filesCounter: 5,
            isOverLimit: false,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
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

        mocks.checkUserFilesRateLimit.mockResolvedValue(mockRateLimit);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("returns error when checkUserFilesRateLimit fails", async () => {
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

        mocks.checkUserFilesRateLimit.mockRejectedValue(
            new Error("Database error"),
        );

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });
});

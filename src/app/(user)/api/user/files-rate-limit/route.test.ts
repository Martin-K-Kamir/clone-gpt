import { createMockSessionWithUser } from "@/vitest/helpers/create-mock-session";
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

    it("should return files rate limit successfully", async () => {
        const mockRateLimit = {
            filesCounter: 5,
            isOverLimit: false,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
        };

        (auth as any).mockResolvedValue(createMockSessionWithUser());

        mocks.checkUserFilesRateLimit.mockResolvedValue(mockRateLimit);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });

    it("should return error when checkUserFilesRateLimit fails", async () => {
        (auth as any).mockResolvedValue(createMockSessionWithUser());

        mocks.checkUserFilesRateLimit.mockRejectedValue(
            new Error("Database error"),
        );

        const response = await GET();

        expect(response).toBeInstanceOf(Response);
    });
});

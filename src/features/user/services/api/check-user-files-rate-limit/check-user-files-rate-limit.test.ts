import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { UserFilesRateLimitResult } from "@/features/user/lib/types";

import { ApiError } from "@/lib/classes";

import { checkUserFilesRateLimit } from "./check-user-files-rate-limit";

describe("checkUserFilesRateLimit", () => {
    it("should return rate limit result when API returns success with data", async () => {
        const mockRateLimit: UserFilesRateLimitResult = {
            isOverLimit: false,
            filesCounter: 5,
        };

        const mockResponse = {
            success: true,
            data: mockRateLimit,
            message: "User rate limit checked successfully",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await checkUserFilesRateLimit();

        expect(result).toEqual(mockRateLimit);
        expect(result.isOverLimit).toBe(false);
        expect(result.filesCounter).toBe(5);
    });

    it("should return rate limit result when user is over limit", async () => {
        const mockRateLimit: UserFilesRateLimitResult = {
            isOverLimit: true,
            reason: "files",
            periodStart: "2024-01-01T00:00:00Z",
            periodEnd: "2024-01-02T00:00:00Z",
            filesCounter: 100,
        };

        const mockResponse = {
            success: true,
            data: mockRateLimit,
            message: "User rate limit checked successfully",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await checkUserFilesRateLimit();

        expect(result).toEqual(mockRateLimit);
        expect(result.isOverLimit).toBe(true);
        expect(result.filesCounter).toBe(100);
    });

    it("should throw ApiError when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(checkUserFilesRateLimit()).rejects.toThrow(ApiError);
        await expect(checkUserFilesRateLimit()).rejects.toThrow(
            "Failed to check user files rate limit",
        );
    });

    it("should throw ApiError with correct status code when API returns error", async () => {
        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }),
        );

        try {
            await checkUserFilesRateLimit();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(403);
            }
        }
    });

    it("should throw ApiError when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "Session is not valid",
            status: 400,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(checkUserFilesRateLimit()).rejects.toThrow(ApiError);
        await expect(checkUserFilesRateLimit()).rejects.toThrow(
            "Session is not valid",
        );

        try {
            await checkUserFilesRateLimit();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(400);
            }
        }
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.error();
            }),
        );

        await expect(checkUserFilesRateLimit()).rejects.toThrow();
    });

    it("should throw ApiError when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user/files-rate-limit", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(checkUserFilesRateLimit()).rejects.toThrow(ApiError);
        await expect(checkUserFilesRateLimit()).rejects.toThrow(
            "Failed to check user files rate limit",
        );

        try {
            await checkUserFilesRateLimit();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(500);
            }
        }
    });
});

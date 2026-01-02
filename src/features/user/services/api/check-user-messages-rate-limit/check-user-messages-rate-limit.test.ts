import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { UserMessagesRateLimitResult } from "@/features/user/lib/types";

import { ApiError } from "@/lib/classes";

import { checkUserMessagesRateLimit } from "./check-user-messages-rate-limit";

describe("checkUserMessagesRateLimit", () => {
    it("should return rate limit result when API returns success with data", async () => {
        const mockRateLimit: UserMessagesRateLimitResult = {
            isOverLimit: false,
            tokensCounter: 5000,
            messagesCounter: 10,
        };

        const mockResponse = {
            success: true,
            data: mockRateLimit,
            message: "User rate limit checked successfully",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await checkUserMessagesRateLimit();

        expect(result).toEqual(mockRateLimit);
        expect(result.isOverLimit).toBe(false);
        expect(result.tokensCounter).toBe(5000);
        expect(result.messagesCounter).toBe(10);
    });

    it("should return rate limit result when user is over limit", async () => {
        const mockRateLimit: UserMessagesRateLimitResult = {
            isOverLimit: true,
            reason: "messages",
            periodStart: "2024-01-01T00:00:00Z",
            periodEnd: "2024-01-02T00:00:00Z",
            tokensCounter: 100000,
            messagesCounter: 100,
        };

        const mockResponse = {
            success: true,
            data: mockRateLimit,
            message: "User rate limit checked successfully",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await checkUserMessagesRateLimit();

        expect(result).toEqual(mockRateLimit);
        expect(result.isOverLimit).toBe(true);
        expect(result.tokensCounter).toBe(100000);
        expect(result.messagesCounter).toBe(100);
    });

    it("should throw ApiError when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(checkUserMessagesRateLimit()).rejects.toThrow(ApiError);
        await expect(checkUserMessagesRateLimit()).rejects.toThrow(
            "Failed to check user messages rate limit",
        );
    });

    it("should throw ApiError with correct status code when API returns error", async () => {
        server.use(
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }),
        );

        try {
            await checkUserMessagesRateLimit();
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
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(checkUserMessagesRateLimit()).rejects.toThrow(ApiError);
        await expect(checkUserMessagesRateLimit()).rejects.toThrow(
            "Session is not valid",
        );

        try {
            await checkUserMessagesRateLimit();
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
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.error();
            }),
        );

        await expect(checkUserMessagesRateLimit()).rejects.toThrow();
    });

    it("should throw ApiError when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user/messages-rate-limit", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(checkUserMessagesRateLimit()).rejects.toThrow(ApiError);
        await expect(checkUserMessagesRateLimit()).rejects.toThrow(
            "Failed to check user messages rate limit",
        );

        try {
            await checkUserMessagesRateLimit();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(500);
            }
        }
    });
});

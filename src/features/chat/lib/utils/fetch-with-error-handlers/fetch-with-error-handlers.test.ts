import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, RateLimitError } from "@/lib/classes";
import {
    HTTP_ERROR_STATUS,
    HTTP_SUCCESS_STATUS,
    RATE_LIMIT_REASON,
} from "@/lib/constants";

import { fetchWithErrorHandlers } from "./fetch-with-error-handlers";

global.fetch = vi.fn();

const mockNavigator = {
    onLine: true,
};

Object.defineProperty(global, "navigator", {
    value: mockNavigator,
    writable: true,
});

describe("fetchWithErrorHandlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigator.onLine = true;
    });

    it("should return response when fetch succeeds", async () => {
        const mockResponse = {
            ok: true,
            status: HTTP_SUCCESS_STATUS.OK,
        } as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        const result = await fetchWithErrorHandlers("https://example.com");

        expect(result).toBe(mockResponse);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://example.com",
            undefined,
        );
    });

    it("should throw ApiError when response is not ok and matches API error schema", async () => {
        const errorData = {
            message: "Not found",
            status: HTTP_ERROR_STATUS.NOT_FOUND,
        };

        const mockResponse = {
            ok: false,
            status: HTTP_ERROR_STATUS.NOT_FOUND,
            json: vi.fn().mockResolvedValue(errorData),
        } as unknown as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        await expect(
            fetchWithErrorHandlers("https://example.com"),
        ).rejects.toBeInstanceOf(ApiError);
    });

    it("should throw connection error when navigator is offline", async () => {
        mockNavigator.onLine = false;

        const mockResponse = {
            ok: false,
            status: HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            json: vi.fn().mockResolvedValue({}),
        } as unknown as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        await expect(
            fetchWithErrorHandlers("https://example.com"),
        ).rejects.toMatchObject({
            message: expect.stringContaining("connection"),
        });
    });

    it("should throw RateLimitError when error matches rate limit schema", async () => {
        const rateLimitError = {
            message: "Rate limit exceeded",
            status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
            error: {
                reason: RATE_LIMIT_REASON.MESSAGES,
                periodStart: new Date().toISOString(),
                periodEnd: new Date().toISOString(),
            },
        };

        const mockResponse = {
            ok: false,
            status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
            json: vi.fn().mockResolvedValue(rateLimitError),
        } as unknown as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        await expect(
            fetchWithErrorHandlers("https://example.com"),
        ).rejects.toBeInstanceOf(RateLimitError);
    });

    it("should throw ApiError when error matches API error schema", async () => {
        const apiError = {
            message: "Bad request",
            status: HTTP_ERROR_STATUS.BAD_REQUEST,
        };

        const mockResponse = {
            ok: false,
            status: HTTP_ERROR_STATUS.BAD_REQUEST,
            json: vi.fn().mockResolvedValue(apiError),
        } as unknown as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        await expect(
            fetchWithErrorHandlers("https://example.com"),
        ).rejects.toBeInstanceOf(ApiError);
    });

    it("should throw original error when it doesn't match any schema", async () => {
        const genericError = {
            message: "Something went wrong",
        };

        const mockResponse = {
            ok: false,
            status: HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            json: vi.fn().mockResolvedValue(genericError),
        } as unknown as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        await expect(
            fetchWithErrorHandlers("https://example.com"),
        ).rejects.toEqual(genericError);
    });

    it("should pass init options to fetch", async () => {
        const mockResponse = {
            ok: true,
            status: HTTP_SUCCESS_STATUS.OK,
        } as Response;

        vi.mocked(global.fetch).mockResolvedValue(mockResponse);

        const init = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        };

        await fetchWithErrorHandlers("https://example.com", init);

        expect(global.fetch).toHaveBeenCalledWith("https://example.com", init);
    });

    it("should handle network errors", async () => {
        const networkError = new Error("Network request failed");
        vi.mocked(global.fetch).mockRejectedValue(networkError);

        await expect(
            fetchWithErrorHandlers("https://example.com"),
        ).rejects.toBe(networkError);
    });
});

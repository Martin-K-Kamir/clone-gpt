import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS } from "@/lib/constants/http";
import type { HttpErrorStatus } from "@/lib/types";

import { API_ERROR_KIND, ApiError } from "./api-error";

describe("ApiError", () => {
    describe("constructor", () => {
        it("should create an ApiError instance with message and status", () => {
            const error = new ApiError(
                "Test error",
                HTTP_ERROR_STATUS.BAD_REQUEST,
            );

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.message).toBe("Test error");
            expect(error.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(error.kind).toBe(API_ERROR_KIND);
            expect(error.name).toBe("ApiError");
        });

        it("should create ApiError with different status codes", () => {
            const statuses: HttpErrorStatus[] = [
                HTTP_ERROR_STATUS.UNAUTHORIZED,
                HTTP_ERROR_STATUS.FORBIDDEN,
                HTTP_ERROR_STATUS.NOT_FOUND,
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            ];

            statuses.forEach(status => {
                const error = new ApiError("Error", status);
                expect(error.status).toBe(status);
            });
        });

        it("should have readonly properties", () => {
            const error = new ApiError("Test", HTTP_ERROR_STATUS.BAD_REQUEST);

            expect(error.kind).toBe(API_ERROR_KIND);
            expect(error.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(error.name).toBe("ApiError");
        });
    });

    describe("getKind", () => {
        it("should return the API_ERROR_KIND constant", () => {
            const kind = ApiError.getKind();

            expect(kind).toBe(API_ERROR_KIND);
            expect(kind).toBe("api_error");
        });

        it("should be a static method", () => {
            expectTypeOf(ApiError.getKind).toBeFunction();
        });
    });

    describe("getInstance", () => {
        it("should create ApiError instance from valid error object", () => {
            const errorData = {
                message: "Test error message",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            };

            const error = ApiError.getInstance(errorData);

            expect(error).toBeInstanceOf(ApiError);
            expect(error?.message).toBe("Test error message");
            expect(error?.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
        });

        it("should return null for invalid error object", () => {
            const invalidError = {
                message: "Test",
                // Missing status
            };

            const error = ApiError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for error with invalid status", () => {
            const invalidError = {
                message: "Test",
                status: 999, // Invalid status code
            };

            const error = ApiError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for non-object input", () => {
            expect(ApiError.getInstance(null)).toBeNull();
            expect(ApiError.getInstance(undefined)).toBeNull();
            expect(ApiError.getInstance("string")).toBeNull();
            expect(ApiError.getInstance(123)).toBeNull();
            expect(ApiError.getInstance([])).toBeNull();
        });

        it("should return null for error with missing message", () => {
            const invalidError = {
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            };

            const error = ApiError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should handle all valid HTTP error statuses", () => {
            const statuses: HttpErrorStatus[] = [
                HTTP_ERROR_STATUS.BAD_REQUEST,
                HTTP_ERROR_STATUS.UNAUTHORIZED,
                HTTP_ERROR_STATUS.FORBIDDEN,
                HTTP_ERROR_STATUS.NOT_FOUND,
                HTTP_ERROR_STATUS.CONFLICT,
                HTTP_ERROR_STATUS.UNPROCESSABLE_ENTITY,
                HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
                HTTP_ERROR_STATUS.BAD_GATEWAY,
                HTTP_ERROR_STATUS.SERVICE_UNAVAILABLE,
                HTTP_ERROR_STATUS.GATEWAY_TIMEOUT,
            ];

            statuses.forEach(status => {
                const errorData = {
                    message: `Error with status ${status}`,
                    status,
                };

                const error = ApiError.getInstance(errorData);

                expect(error).toBeInstanceOf(ApiError);
                expect(error?.status).toBe(status);
            });
        });
    });

    describe("type tests", () => {
        it("should have correct type for status", () => {
            const error = new ApiError("Test", HTTP_ERROR_STATUS.BAD_REQUEST);
            expectTypeOf(error.status).toEqualTypeOf<HttpErrorStatus>();
        });

        it("should have correct type for getInstance return", () => {
            const errorData = {
                message: "Test",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            };
            const error = ApiError.getInstance(errorData);
            expectTypeOf(error).toEqualTypeOf<ApiError | null>();
        });
    });

    describe("Error inheritance", () => {
        it("should be an instance of Error", () => {
            const error = new ApiError("Test", HTTP_ERROR_STATUS.BAD_REQUEST);

            expect(error).toBeInstanceOf(Error);
            expect(error instanceof Error).toBe(true);
        });

        it("should have Error properties", () => {
            const error = new ApiError(
                "Test message",
                HTTP_ERROR_STATUS.BAD_REQUEST,
            );

            expect(error.message).toBe("Test message");
            expect(error.stack).toBeDefined();
        });
    });
});

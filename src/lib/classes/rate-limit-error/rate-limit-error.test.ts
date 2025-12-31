import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS, RATE_LIMIT_REASON } from "@/lib/constants";
import type { RateLimitReason } from "@/lib/types";

import { RATE_LIMIT_ERROR, RateLimitError } from "./rate-limit-error";

describe("RateLimitError", () => {
    describe("constructor", () => {
        it("should create a RateLimitError instance with string dates", () => {
            const error = new RateLimitError(
                "Rate limit exceeded",
                RATE_LIMIT_REASON.MESSAGES,
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
            );

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(RateLimitError);
            expect(error.message).toBe("Rate limit exceeded");
            expect(error.reason).toBe(RATE_LIMIT_REASON.MESSAGES);
            expect(error.periodStart).toBeInstanceOf(Date);
            expect(error.periodEnd).toBeInstanceOf(Date);
            expect(error.kind).toBe(RATE_LIMIT_ERROR);
            expect(error.status).toBe(HTTP_ERROR_STATUS.TOO_MANY_REQUESTS);
            expect(error.name).toBe("RateLimitError");
        });

        it("should create a RateLimitError instance with Date objects", () => {
            const periodStart = new Date("2024-01-01T00:00:00Z");
            const periodEnd = new Date("2024-01-01T01:00:00Z");

            const error = new RateLimitError(
                "Rate limit exceeded",
                RATE_LIMIT_REASON.TOKENS,
                periodStart,
                periodEnd,
            );

            expect(error.periodStart).toBeInstanceOf(Date);
            expect(error.periodEnd).toBeInstanceOf(Date);
            expect(error.periodStart.getTime()).toBe(periodStart.getTime());
            expect(error.periodEnd.getTime()).toBe(periodEnd.getTime());
        });

        it("should handle all rate limit reasons", () => {
            const reasons: RateLimitReason[] = [
                RATE_LIMIT_REASON.MESSAGES,
                RATE_LIMIT_REASON.TOKENS,
                RATE_LIMIT_REASON.FILES,
            ];

            reasons.forEach(reason => {
                const error = new RateLimitError(
                    "Rate limit exceeded",
                    reason,
                    "2024-01-01T00:00:00Z",
                    "2024-01-01T01:00:00Z",
                );

                expect(error.reason).toBe(reason);
            });
        });

        it("should have readonly properties", () => {
            const error = new RateLimitError(
                "Test",
                RATE_LIMIT_REASON.MESSAGES,
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
            );

            // Properties are readonly by design (readonly keyword in class)
            expect(error.kind).toBe(RATE_LIMIT_ERROR);
            expect(error.status).toBe(HTTP_ERROR_STATUS.TOO_MANY_REQUESTS);
            expect(error.reason).toBe(RATE_LIMIT_REASON.MESSAGES);
            expect(error.name).toBe("RateLimitError");
        });

        it("should always have TOO_MANY_REQUESTS status", () => {
            const error = new RateLimitError(
                "Test",
                RATE_LIMIT_REASON.MESSAGES,
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
            );

            expect(error.status).toBe(HTTP_ERROR_STATUS.TOO_MANY_REQUESTS);
        });
    });

    describe("getKind", () => {
        it("should return the RATE_LIMIT_ERROR constant", () => {
            const kind = RateLimitError.getKind();

            expect(kind).toBe(RATE_LIMIT_ERROR);
            expect(kind).toBe("rate_limit_error");
        });

        it("should be a static method", () => {
            expectTypeOf(RateLimitError.getKind).toBeFunction();
        });
    });

    describe("getInstance", () => {
        it("should create RateLimitError instance from valid error object", () => {
            const errorData = {
                message: "Rate limit exceeded",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                error: {
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: "2024-01-01T00:00:00Z",
                    periodEnd: "2024-01-01T01:00:00Z",
                },
            };

            const error = RateLimitError.getInstance(errorData);

            expect(error).toBeInstanceOf(RateLimitError);
            expect(error?.message).toBe("Rate limit exceeded");
            expect(error?.reason).toBe(RATE_LIMIT_REASON.MESSAGES);
            expect(error?.periodStart).toBeInstanceOf(Date);
            expect(error?.periodEnd).toBeInstanceOf(Date);
            expect(error?.status).toBe(HTTP_ERROR_STATUS.TOO_MANY_REQUESTS);
        });

        it("should return null for invalid error object", () => {
            const invalidError = {
                message: "Test",
                // Missing status and error
            };

            const error = RateLimitError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for error with wrong status", () => {
            const invalidError = {
                message: "Test",
                status: HTTP_ERROR_STATUS.BAD_REQUEST, // Wrong status
                error: {
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: "2024-01-01T00:00:00Z",
                    periodEnd: "2024-01-01T01:00:00Z",
                },
            };

            const error = RateLimitError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for error with missing error object", () => {
            const invalidError = {
                message: "Test",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                // Missing error
            };

            const error = RateLimitError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for error with invalid reason", () => {
            const invalidError = {
                message: "Test",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                error: {
                    reason: "invalid_reason" as RateLimitReason,
                    periodStart: "2024-01-01T00:00:00Z",
                    periodEnd: "2024-01-01T01:00:00Z",
                },
            };

            const error = RateLimitError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for error with missing period dates", () => {
            const invalidError = {
                message: "Test",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                error: {
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    // Missing periodStart and periodEnd
                },
            };

            const error = RateLimitError.getInstance(invalidError);

            expect(error).toBeNull();
        });

        it("should return null for non-object input", () => {
            expect(RateLimitError.getInstance(null)).toBeNull();
            expect(RateLimitError.getInstance(undefined)).toBeNull();
            expect(RateLimitError.getInstance("string")).toBeNull();
            expect(RateLimitError.getInstance(123)).toBeNull();
            expect(RateLimitError.getInstance([])).toBeNull();
        });

        it("should handle all rate limit reasons in getInstance", () => {
            const reasons: RateLimitReason[] = [
                RATE_LIMIT_REASON.MESSAGES,
                RATE_LIMIT_REASON.TOKENS,
                RATE_LIMIT_REASON.FILES,
            ];

            reasons.forEach(reason => {
                const errorData = {
                    message: "Rate limit exceeded",
                    status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                    error: {
                        reason,
                        periodStart: "2024-01-01T00:00:00Z",
                        periodEnd: "2024-01-01T01:00:00Z",
                    },
                };

                const error = RateLimitError.getInstance(errorData);

                expect(error).toBeInstanceOf(RateLimitError);
                expect(error?.reason).toBe(reason);
            });
        });
    });

    describe("date handling", () => {
        it("should convert string dates to Date objects", () => {
            const periodStartStr = "2024-01-01T00:00:00Z";
            const periodEndStr = "2024-01-01T01:00:00Z";

            const error = new RateLimitError(
                "Test",
                RATE_LIMIT_REASON.MESSAGES,
                periodStartStr,
                periodEndStr,
            );

            expect(error.periodStart).toBeInstanceOf(Date);
            expect(error.periodEnd).toBeInstanceOf(Date);
            expect(error.periodStart.toISOString()).toBe(
                "2024-01-01T00:00:00.000Z",
            );
            expect(error.periodEnd.toISOString()).toBe(
                "2024-01-01T01:00:00.000Z",
            );
            expect(error.periodStart.getTime()).toBe(
                new Date(periodStartStr).getTime(),
            );
            expect(error.periodEnd.getTime()).toBe(
                new Date(periodEndStr).getTime(),
            );
        });

        it("should preserve Date objects", () => {
            const periodStart = new Date("2024-01-01T00:00:00Z");
            const periodEnd = new Date("2024-01-01T01:00:00Z");

            const error = new RateLimitError(
                "Test",
                RATE_LIMIT_REASON.MESSAGES,
                periodStart,
                periodEnd,
            );

            expect(error.periodStart).toBeInstanceOf(Date);
            expect(error.periodEnd).toBeInstanceOf(Date);
        });
    });

    describe("type tests", () => {
        it("should have correct type for reason", () => {
            const error = new RateLimitError(
                "Test",
                RATE_LIMIT_REASON.MESSAGES,
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
            );
            expectTypeOf(error.reason).toEqualTypeOf<RateLimitReason>();
        });

        it("should have correct type for getInstance return", () => {
            const errorData = {
                message: "Test",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
                error: {
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: "2024-01-01T00:00:00Z",
                    periodEnd: "2024-01-01T01:00:00Z",
                },
            };
            const error = RateLimitError.getInstance(errorData);
            expectTypeOf(error).toEqualTypeOf<RateLimitError | null>();
        });
    });

    describe("Error inheritance", () => {
        it("should be an instance of Error", () => {
            const error = new RateLimitError(
                "Test",
                RATE_LIMIT_REASON.MESSAGES,
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
            );

            expect(error).toBeInstanceOf(Error);
            expect(error instanceof Error).toBe(true);
        });

        it("should have Error properties", () => {
            const error = new RateLimitError(
                "Test message",
                RATE_LIMIT_REASON.MESSAGES,
                "2024-01-01T00:00:00Z",
                "2024-01-01T01:00:00Z",
            );

            expect(error.message).toBe("Test message");
            expect(error.stack).toBeDefined();
        });
    });
});

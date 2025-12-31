import { describe, expect, it } from "vitest";

import { RATE_LIMIT_REASON } from "@/lib/constants";

import { getRateLimitState } from "./get-rate-limit-state";

describe("getRateLimitState", () => {
    it("should return null when no rate limits are exceeded", () => {
        const configs = [
            {
                message: "Messages limit",
                data: {
                    isOverLimit: false as const,
                    messagesCounter: 10,
                    tokensCounter: 1000,
                },
            },
            {
                message: "Files limit",
                data: {
                    isOverLimit: false as const,
                    filesCounter: 5,
                },
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toBeNull();
    });

    it("should return null when all data is undefined", () => {
        const configs = [
            {
                message: "Messages limit",
                data: undefined,
            },
            {
                message: "Files limit",
                data: undefined,
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toBeNull();
    });

    it("should return state for single exceeded limit", () => {
        const periodEnd = new Date(Date.now() + 3600000).toISOString();
        const configs = [
            {
                message: "Messages limit exceeded",
                data: {
                    isOverLimit: true as const,
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: new Date().toISOString(),
                    periodEnd,
                    messagesCounter: 100,
                    tokensCounter: 5000,
                },
            },
            {
                message: "Files limit",
                data: {
                    isOverLimit: false,
                    filesCounter: 5,
                },
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toEqual({
            message: "Messages limit exceeded",
            periodEnd,
        });
    });

    it("should return state with latest periodEnd when multiple limits exceeded", () => {
        const earlierPeriodEnd = new Date(Date.now() + 1800000).toISOString();
        const laterPeriodEnd = new Date(Date.now() + 7200000).toISOString();

        const configs = [
            {
                message: "Messages limit exceeded",
                data: {
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: new Date().toISOString(),
                    periodEnd: earlierPeriodEnd,
                    messagesCounter: 100,
                    tokensCounter: 5000,
                },
            },
            {
                message: "Files limit exceeded",
                data: {
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.FILES,
                    periodStart: new Date().toISOString(),
                    periodEnd: laterPeriodEnd,
                    filesCounter: 50,
                },
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toEqual({
            message: "Daily limits reached. Try again after {periodEnd}.",
            periodEnd: laterPeriodEnd,
        });
    });

    it("should return state with earliest periodEnd when it comes first", () => {
        const earlierPeriodEnd = new Date(Date.now() + 1800000).toISOString();
        const laterPeriodEnd = new Date(Date.now() + 7200000).toISOString();

        const configs = [
            {
                message: "Messages limit exceeded",
                data: {
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: new Date().toISOString(),
                    periodEnd: laterPeriodEnd,
                    messagesCounter: 100,
                    tokensCounter: 5000,
                },
            },
            {
                message: "Files limit exceeded",
                data: {
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.FILES,
                    periodStart: new Date().toISOString(),
                    periodEnd: earlierPeriodEnd,
                    filesCounter: 50,
                },
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toEqual({
            message: "Daily limits reached. Try again after {periodEnd}.",
            periodEnd: laterPeriodEnd,
        });
    });

    it("should filter out non-exceeded limits", () => {
        const periodEnd = new Date(Date.now() + 3600000).toISOString();
        const configs = [
            {
                message: "Messages limit",
                data: {
                    isOverLimit: false as const,
                    messagesCounter: 10,
                    tokensCounter: 1000,
                },
            },
            {
                message: "Files limit exceeded",
                data: {
                    isOverLimit: true as const,
                    reason: RATE_LIMIT_REASON.FILES,
                    periodStart: new Date().toISOString(),
                    periodEnd,
                    filesCounter: 50,
                },
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toEqual({
            message: "Files limit exceeded",
            periodEnd,
        });
    });

    it("should handle empty configs array", () => {
        const result = getRateLimitState([]);

        expect(result).toBeNull();
    });

    it("should handle three exceeded limits", () => {
        const periodEnd1 = new Date(Date.now() + 1800000).toISOString();
        const periodEnd2 = new Date(Date.now() + 3600000).toISOString();
        const periodEnd3 = new Date(Date.now() + 7200000).toISOString();

        const configs = [
            {
                message: "Messages limit exceeded",
                data: {
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: new Date().toISOString(),
                    periodEnd: periodEnd1,
                    messagesCounter: 100,
                    tokensCounter: 5000,
                },
            },
            {
                message: "Tokens limit exceeded",
                data: {
                    isOverLimit: true as const,
                    reason: RATE_LIMIT_REASON.TOKENS,
                    periodStart: new Date().toISOString(),
                    periodEnd: periodEnd2,
                    messagesCounter: 50,
                    tokensCounter: 10000,
                },
            },
            {
                message: "Files limit exceeded",
                data: {
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.FILES,
                    periodStart: new Date().toISOString(),
                    periodEnd: periodEnd3,
                    filesCounter: 50,
                },
            },
        ];

        const result = getRateLimitState(configs as any);

        expect(result).toEqual({
            message: "Daily limits reached. Try again after {periodEnd}.",
            periodEnd: periodEnd3,
        });
    });
});

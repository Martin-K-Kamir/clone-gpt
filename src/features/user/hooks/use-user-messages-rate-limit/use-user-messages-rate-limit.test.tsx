import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { useRateLimit } from "@/hooks";

import { useUserMessagesRateLimit } from "./use-user-messages-rate-limit";

vi.mock("@/hooks", () => ({
    useRateLimit: vi.fn(),
}));

describe("useUserMessagesRateLimit", () => {
    const mockUseRateLimit = vi.mocked(useRateLimit);
    const userId = generateUserId();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseRateLimit.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn(),
        } as any);
    });

    it("should configure rate limit for user messages and tokens", () => {
        renderHook(() => useUserMessagesRateLimit({ userId }));

        expect(mockUseRateLimit).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [tag.userMessagesRateLimit(userId)],
                reasons: [RATE_LIMIT_REASON.MESSAGES, RATE_LIMIT_REASON.TOKENS],
            }),
        );
    });

    it("should pass callbacks when provided", () => {
        const onLimitExceeded = vi.fn();
        const onLimitAvailable = vi.fn();
        const onPeriodReset = vi.fn();

        renderHook(() =>
            useUserMessagesRateLimit({
                userId,
                onLimitExceeded,
                onLimitAvailable,
                onPeriodReset,
            }),
        );

        expect(mockUseRateLimit).toHaveBeenCalledWith(
            expect.objectContaining({
                onLimitExceeded,
                onLimitAvailable,
                onPeriodReset,
            }),
        );
    });

    it("should pass errorToSync when provided", () => {
        const error = new Error("test error");

        renderHook(() =>
            useUserMessagesRateLimit({
                userId,
                errorToSync: error,
            }),
        );

        expect(mockUseRateLimit).toHaveBeenCalledWith(
            expect.objectContaining({
                errorToSync: error,
            }),
        );
    });

    it("should return result from useRateLimit", () => {
        const mockResult = {
            data: { isOverLimit: false },
            isLoading: true,
        } as any;

        mockUseRateLimit.mockReturnValue(mockResult);

        const { result } = renderHook(() =>
            useUserMessagesRateLimit({ userId }),
        );

        expect(result.current).toBe(mockResult);
    });
});

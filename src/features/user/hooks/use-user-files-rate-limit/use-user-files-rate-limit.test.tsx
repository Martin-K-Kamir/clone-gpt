import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { useRateLimit } from "@/hooks";

import { useUserFilesRateLimit } from "./use-user-files-rate-limit";

vi.mock("@/hooks", () => ({
    useRateLimit: vi.fn(),
}));

describe("useUserFilesRateLimit", () => {
    const mockUseRateLimit = vi.mocked(useRateLimit);
    const userId = "user-123" as DBUserId;

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

    it("should configure rate limit for user files", () => {
        renderHook(() => useUserFilesRateLimit({ userId }));

        expect(mockUseRateLimit).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: [tag.userFilesRateLimit(userId)],
                reasons: [RATE_LIMIT_REASON.FILES],
            }),
        );
    });

    it("should pass callbacks when provided", () => {
        const onLimitExceeded = vi.fn();
        const onLimitAvailable = vi.fn();
        const onPeriodReset = vi.fn();

        renderHook(() =>
            useUserFilesRateLimit({
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
            useUserFilesRateLimit({
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

        const { result } = renderHook(() => useUserFilesRateLimit({ userId }));

        expect(result.current).toBe(mockResult);
    });
});

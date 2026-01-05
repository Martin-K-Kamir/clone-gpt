import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RateLimitError } from "@/lib/classes";
import { RATE_LIMIT_REASON } from "@/lib/constants";
import type { RateLimitResult } from "@/lib/types";

import { useRateLimit } from "./use-rate-limit";

describe("useRateLimit", () => {
    let queryClient: QueryClient;
    let mockQueryFn: () => Promise<RateLimitResult<Record<string, number>>>;

    beforeEach(() => {
        vi.useFakeTimers();

        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
            },
        });

        mockQueryFn = vi.fn() as () => Promise<
            RateLimitResult<Record<string, number>>
        >;

        return () => {
            consoleError.mockRestore();
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
        queryClient.clear();
    });

    const createWrapper = () => {
        return ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };

    it("should return query result from useQuery", () => {
        const queryData: RateLimitResult<{ counter: number }> = {
            isOverLimit: false,
            counter: 50,
        };

        queryClient.setQueryData(["test"], queryData);

        const { result } = renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                }),
            { wrapper: createWrapper() },
        );

        expect(result.current.data).toEqual(queryData);
        expect(result.current.refetch).toBeDefined();
    });

    it("should call onLimitExceeded when data indicates limit exceeded", () => {
        const onLimitExceeded = vi.fn();
        const rateLimitData: RateLimitResult<{ counter: number }> = {
            isOverLimit: true,
            reason: RATE_LIMIT_REASON.MESSAGES,
            periodStart: new Date().toISOString(),
            periodEnd: new Date(Date.now() + 1000).toISOString(),
            counter: 100,
        };

        queryClient.setQueryData(["test"], rateLimitData);

        renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                    onLimitExceeded,
                }),
            { wrapper: createWrapper() },
        );

        expect(onLimitExceeded).toHaveBeenCalledWith(rateLimitData);
    });

    it("should call onLimitAvailable when data indicates limit available", () => {
        const onLimitAvailable = vi.fn();
        const rateLimitData: RateLimitResult<{ counter: number }> = {
            isOverLimit: false,
            counter: 50,
        };

        queryClient.setQueryData(["test"], rateLimitData);

        renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                    onLimitAvailable,
                }),
            { wrapper: createWrapper() },
        );

        expect(onLimitAvailable).toHaveBeenCalledWith(rateLimitData);
    });

    it("should not call callbacks when data is undefined", () => {
        const onLimitExceeded = vi.fn();
        const onLimitAvailable = vi.fn();

        renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                    onLimitExceeded,
                    onLimitAvailable,
                }),
            { wrapper: createWrapper() },
        );

        expect(onLimitExceeded).not.toHaveBeenCalled();
        expect(onLimitAvailable).not.toHaveBeenCalled();
    });

    it("should set timeout to refetch when period ends and call onPeriodReset", () => {
        const onPeriodReset = vi.fn();
        const now = Date.now();
        const periodEnd = new Date(now + 1000);

        const rateLimitData: RateLimitResult<{ counter: number }> = {
            isOverLimit: true,
            reason: RATE_LIMIT_REASON.MESSAGES,
            periodStart: new Date(now - 5000).toISOString(),
            periodEnd: periodEnd.toISOString(),
            counter: 100,
        };

        queryClient.setQueryData(["test"], rateLimitData);

        const { result } = renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                    onPeriodReset,
                }),
            { wrapper: createWrapper() },
        );

        const refetchSpy = vi.spyOn(result.current, "refetch");

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(refetchSpy).toHaveBeenCalled();
        expect(onPeriodReset).toHaveBeenCalled();
    });

    it("should not set timeout when period has already ended", () => {
        const onPeriodReset = vi.fn();
        const now = Date.now();
        const periodEnd = new Date(now - 1000);

        const rateLimitData: RateLimitResult<{ counter: number }> = {
            isOverLimit: true,
            reason: RATE_LIMIT_REASON.MESSAGES,
            periodStart: new Date(now - 5000).toISOString(),
            periodEnd: periodEnd.toISOString(),
            counter: 100,
        };

        queryClient.setQueryData(["test"], rateLimitData);

        const { result } = renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                    onPeriodReset,
                }),
            { wrapper: createWrapper() },
        );

        const refetchSpy = vi.spyOn(result.current, "refetch");

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(refetchSpy).not.toHaveBeenCalled();
        expect(onPeriodReset).not.toHaveBeenCalled();
    });

    it("should clear timeout on unmount", () => {
        const onPeriodReset = vi.fn();
        const now = Date.now();
        const periodEnd = new Date(now + 5000);

        const rateLimitData: RateLimitResult<{ counter: number }> = {
            isOverLimit: true,
            reason: RATE_LIMIT_REASON.MESSAGES,
            periodStart: new Date(now - 5000).toISOString(),
            periodEnd: periodEnd.toISOString(),
            counter: 100,
        };

        queryClient.setQueryData(["test"], rateLimitData);

        const { result, unmount } = renderHook(
            () =>
                useRateLimit({
                    queryKey: ["test"],
                    queryFn: mockQueryFn,
                    reasons: [],
                    onPeriodReset,
                }),
            { wrapper: createWrapper() },
        );

        const refetchSpy = vi.spyOn(result.current, "refetch");

        unmount();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(refetchSpy).not.toHaveBeenCalled();
        expect(onPeriodReset).not.toHaveBeenCalled();
    });

    it("should sync query data when errorToSync is RateLimitError with matching reason", () => {
        const queryKey = ["test"];
        const periodStart = new Date();
        const periodEnd = new Date(Date.now() + 1000);
        const errorToSync = new RateLimitError(
            "Rate limit exceeded",
            RATE_LIMIT_REASON.MESSAGES,
            periodStart,
            periodEnd,
        );

        const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

        renderHook(
            () =>
                useRateLimit({
                    queryKey,
                    queryFn: mockQueryFn,
                    reasons: [RATE_LIMIT_REASON.MESSAGES],
                    errorToSync,
                }),
            { wrapper: createWrapper() },
        );

        expect(setQueryDataSpy).toHaveBeenCalledWith(queryKey, {
            isOverLimit: true,
            periodEnd: periodEnd.toISOString(),
            periodStart: periodStart.toISOString(),
            reason: RATE_LIMIT_REASON.MESSAGES,
        });
    });

    it("should not sync query data when errorToSync is RateLimitError with non-matching reason", () => {
        const queryKey = ["test"];
        const periodStart = new Date();
        const periodEnd = new Date(Date.now() + 1000);
        const errorToSync = new RateLimitError(
            "Rate limit exceeded",
            RATE_LIMIT_REASON.TOKENS,
            periodStart,
            periodEnd,
        );

        const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

        renderHook(
            () =>
                useRateLimit({
                    queryKey,
                    queryFn: mockQueryFn,
                    reasons: [RATE_LIMIT_REASON.MESSAGES],
                    errorToSync,
                }),
            { wrapper: createWrapper() },
        );

        expect(setQueryDataSpy).toHaveBeenCalled();
    });
});

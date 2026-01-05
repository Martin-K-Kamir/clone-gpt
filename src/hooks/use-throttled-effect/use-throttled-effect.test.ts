import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThrottledEffect } from "./use-throttled-effect";

describe("useThrottledEffect", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("should call effect immediately on mount", () => {
        const effect = vi.fn();

        renderHook(() => useThrottledEffect(effect, [], 100));

        expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should throttle effect calls based on delay", () => {
        const effect = vi.fn();

        const { rerender } = renderHook(
            ({ deps }) => useThrottledEffect(effect, deps, 100),
            {
                initialProps: { deps: [1] },
            },
        );

        rerender({ deps: [2] });
        expect(effect).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        expect(effect).toHaveBeenCalledTimes(2);
    });

    it("should call effect immediately if delay has passed", () => {
        const effect = vi.fn();

        const { rerender } = renderHook(
            ({ deps }) => useThrottledEffect(effect, deps, 100),
            {
                initialProps: { deps: [1] },
            },
        );

        vi.advanceTimersByTime(100);

        rerender({ deps: [2] });
        expect(effect).toHaveBeenCalledTimes(2);
    });

    it("should use default delay of 300ms", () => {
        const effect = vi.fn();

        const { rerender } = renderHook(
            ({ deps }) => useThrottledEffect(effect, deps),
            {
                initialProps: { deps: [1] },
            },
        );

        rerender({ deps: [2] });
        vi.advanceTimersByTime(300);

        expect(effect).toHaveBeenCalledTimes(2);
    });

    it("should call cleanup function when effect is replaced", () => {
        const cleanup1 = vi.fn();
        const cleanup2 = vi.fn();
        const effect1 = vi.fn(() => cleanup1);
        const effect2 = vi.fn(() => cleanup2);

        const { rerender } = renderHook(
            ({ effect, deps }) => useThrottledEffect(effect, deps, 100),
            {
                initialProps: { effect: effect1, deps: [1] },
            },
        );

        rerender({ effect: effect2, deps: [2] });
        expect(cleanup1).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        expect(effect2).toHaveBeenCalledTimes(1);
    });

    it("should not call effect when dependencies do not change", () => {
        const effect = vi.fn();
        const deps = [1];

        const { rerender } = renderHook(
            ({ deps }) => useThrottledEffect(effect, deps, 100),
            {
                initialProps: { deps },
            },
        );

        rerender({ deps });
        vi.advanceTimersByTime(100);

        expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should cancel pending effect on unmount", () => {
        const effect = vi.fn();

        const { unmount, rerender } = renderHook(
            ({ deps }) => useThrottledEffect(effect, deps, 100),
            {
                initialProps: { deps: [1] },
            },
        );

        rerender({ deps: [2] });
        unmount();
        vi.advanceTimersByTime(100);

        expect(effect).toHaveBeenCalledTimes(1);
    });
});

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedEffect } from "./use-debounced-effect";

describe("useDebouncedEffect", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("should call effect after delay", () => {
        const effect = vi.fn();
        renderHook(() => useDebouncedEffect(effect, [], 100));

        vi.advanceTimersByTime(100);

        expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should not call effect before delay completes", () => {
        const effect = vi.fn();
        renderHook(() => useDebouncedEffect(effect, [], 100));

        vi.advanceTimersByTime(99);

        expect(effect).not.toHaveBeenCalled();
    });

    it("should cancel previous effect when dependencies change before delay", () => {
        const effect = vi.fn();

        const { rerender } = renderHook(
            ({ deps }) => useDebouncedEffect(effect, deps, 100),
            {
                initialProps: { deps: [1] },
            },
        );

        vi.advanceTimersByTime(50);
        rerender({ deps: [2] });
        vi.advanceTimersByTime(100);

        expect(effect).toHaveBeenCalledTimes(1);
    });

    it("should cancel effect on unmount", () => {
        const effect = vi.fn();

        const { unmount } = renderHook(() =>
            useDebouncedEffect(effect, [1], 100),
        );

        vi.advanceTimersByTime(50);
        unmount();
        vi.advanceTimersByTime(100);

        expect(effect).not.toHaveBeenCalled();
    });

    it("should re-run effect when delay changes", () => {
        const effect = vi.fn();

        const { rerender } = renderHook(
            ({ delay }) => useDebouncedEffect(effect, [1], delay),
            {
                initialProps: { delay: 100 },
            },
        );

        vi.advanceTimersByTime(50);
        rerender({ delay: 200 });
        vi.advanceTimersByTime(200);

        expect(effect).toHaveBeenCalledTimes(1);
    });
});

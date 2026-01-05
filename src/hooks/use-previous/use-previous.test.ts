import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePrevious } from "./use-previous";

describe("usePrevious", () => {
    it("should return undefined on initial render", () => {
        const { result } = renderHook(() => usePrevious("test"));

        expect(result.current).toBeUndefined();
    });

    it("should return previous value after update", () => {
        const { result, rerender } = renderHook(
            ({ value }) => usePrevious(value),
            {
                initialProps: { value: "first" },
            },
        );

        expect(result.current).toBeUndefined();

        rerender({ value: "second" });
        expect(result.current).toBe("first");

        rerender({ value: "third" });
        expect(result.current).toBe("second");
    });

    it("should work with different value types", () => {
        const obj1 = { a: 1 };
        const obj2 = { a: 2 };

        const { result, rerender } = renderHook(
            ({ value }: { value: number | { a: number } }) =>
                usePrevious(value),
            {
                initialProps: { value: 1 as number | { a: number } },
            },
        );

        rerender({ value: 2 });
        expect(result.current).toBe(1);

        rerender({ value: obj1 });
        expect(result.current).toBe(2);

        rerender({ value: obj2 });
        expect(result.current).toBe(obj1);
    });

    it("should handle null and undefined", () => {
        const { result, rerender } = renderHook(
            ({ value }) => usePrevious(value),
            {
                initialProps: { value: null as null | undefined | string },
            },
        );

        rerender({ value: undefined });
        expect(result.current).toBe(null);

        rerender({ value: "value" });
        expect(result.current).toBeUndefined();
    });

    it("should maintain reference equality when value does not change", () => {
        const value = { test: "value" };
        const { result, rerender } = renderHook(
            ({ value }) => usePrevious(value),
            {
                initialProps: { value },
            },
        );

        rerender({ value });
        const previousValue = result.current;

        rerender({ value });
        expect(result.current).toBe(previousValue);
    });
});

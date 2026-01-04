import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHasMounted } from "./use-has-mounted";

describe("useHasMounted", () => {
    it("returns true after mount", () => {
        const { result } = renderHook(() => useHasMounted());

        expect(result.current).toBe(true);
    });

    it("remains true on subsequent renders", () => {
        const { result, rerender } = renderHook(() => useHasMounted());

        rerender();
        rerender();

        expect(result.current).toBe(true);
    });
});

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHasMounted } from "./use-has-mounted";

describe("useHasMounted", () => {
    it("should return true after mount", () => {
        const { result } = renderHook(() => useHasMounted());

        expect(result.current).toBe(true);
    });

    it("should remain true on subsequent renders", () => {
        const { result, rerender } = renderHook(() => useHasMounted());

        rerender();
        rerender();

        expect(result.current).toBe(true);
    });
});

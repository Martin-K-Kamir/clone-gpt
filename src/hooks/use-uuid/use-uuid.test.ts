import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useUuid } from "./use-uuid";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("useUuid", () => {
    it("returns a valid UUID", () => {
        const { result } = renderHook(() => useUuid());

        const uuid = result.current();

        expect(typeof uuid).toBe("string");
        expect(uuid).toMatch(UUID_REGEX);
    });

    it("returns the same UUID on multiple calls", () => {
        const { result } = renderHook(() => useUuid());

        const uuid1 = result.current();
        const uuid2 = result.current();

        expect(uuid1).toBe(uuid2);
    });

    it("returns different UUIDs for different hook instances", () => {
        const { result: result1 } = renderHook(() => useUuid());
        const { result: result2 } = renderHook(() => useUuid());

        expect(result1.current()).not.toBe(result2.current());
    });
});

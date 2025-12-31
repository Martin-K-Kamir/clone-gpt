import { describe, expect, expectTypeOf, it } from "vitest";

import { toolsInstructions } from "./tools-instructions";

describe("toolsInstructions", () => {
    it("should return a string", () => {
        const result = toolsInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should always return a non-empty string", () => {
        const result = toolsInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result.length).toBeGreaterThan(0);
    });
});

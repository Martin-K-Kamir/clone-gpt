import { describe, expect, expectTypeOf, it } from "vitest";

import { weatherToolInstructions } from "./weather-tool-instructions";

describe("weatherToolInstructions", () => {
    it("should return a string", () => {
        const result = weatherToolInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should always return a non-empty string", () => {
        const result = weatherToolInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result.length).toBeGreaterThan(0);
    });
});

import { describe, expect, expectTypeOf, it } from "vitest";

import { imageToolInstructions } from "./image-tool-instructions";

describe("imageToolInstructions", () => {
    it("should return a string", () => {
        const result = imageToolInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should always return a non-empty string", () => {
        const result = imageToolInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result.length).toBeGreaterThan(0);
    });
});

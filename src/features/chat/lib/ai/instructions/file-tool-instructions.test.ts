import { describe, expect, expectTypeOf, it } from "vitest";

import { fileToolInstructions } from "./file-tool-instructions";

describe("fileToolInstructions", () => {
    it("should return a string", () => {
        const result = fileToolInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should always return a non-empty string", () => {
        const result = fileToolInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result.length).toBeGreaterThan(0);
    });
});

import { describe, expect, expectTypeOf, it } from "vitest";

import { chatFormattingInstructions } from "./formatting-instructions";

describe("chatFormattingInstructions", () => {
    it("should return a string", () => {
        const result = chatFormattingInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should always return a non-empty string", () => {
        const result = chatFormattingInstructions();

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result.length).toBeGreaterThan(0);
    });
});

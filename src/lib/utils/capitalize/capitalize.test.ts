import { describe, expect, it } from "vitest";

import { capitalize } from "./capitalize";

describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
        expect(capitalize("hello")).toBe("Hello");
        expect(capitalize("world")).toBe("World");
    });

    it("should handle already capitalized strings", () => {
        expect(capitalize("Hello")).toBe("Hello");
        expect(capitalize("WORLD")).toBe("WORLD");
    });

    it("should handle empty strings", () => {
        expect(capitalize("")).toBe("");
    });

    it("should handle single character strings", () => {
        expect(capitalize("a")).toBe("A");
        expect(capitalize("A")).toBe("A");
    });

    it("should handle strings with numbers", () => {
        expect(capitalize("123abc")).toBe("123abc");
        expect(capitalize("abc123")).toBe("Abc123");
    });

    it("should handle strings with special characters", () => {
        expect(capitalize("!hello")).toBe("!hello");
        expect(capitalize(" hello")).toBe(" hello");
    });
});

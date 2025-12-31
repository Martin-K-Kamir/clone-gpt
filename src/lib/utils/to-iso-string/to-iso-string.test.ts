import { describe, expect, it } from "vitest";

import { toISOString } from "./to-iso-string";

describe("toISOString", () => {
    it("should convert Date object to ISO string", () => {
        const date = new Date("2024-01-15T12:00:00Z");
        const result = toISOString(date);
        expect(result).toBe("2024-01-15T12:00:00.000Z");
    });

    it("should convert valid date string to ISO string", () => {
        const result = toISOString("2024-01-15T12:00:00Z");
        expect(result).toBe("2024-01-15T12:00:00.000Z");
    });

    it("should handle ISO string input", () => {
        const input = "2024-01-15T12:00:00.000Z";
        const result = toISOString(input);
        expect(result).toBe(input);
    });

    it("should handle date string in different format", () => {
        const result = toISOString("January 15, 2024");
        expect(typeof result).toBe("string");
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should throw error for invalid date string", () => {
        expect(() => toISOString("invalid-date")).toThrow(
            "Invalid date string: invalid-date",
        );
    });

    it("should throw error for empty string", () => {
        expect(() => toISOString("")).toThrow("Invalid date string: ");
    });

    it("should handle current date", () => {
        const date = new Date();
        const result = toISOString(date);
        expect(result).toBe(date.toISOString());
    });

    it("should handle date string with timezone", () => {
        const result = toISOString("2024-01-15T12:00:00+05:00");
        expect(typeof result).toBe("string");
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});

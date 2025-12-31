import { describe, expect, it } from "vitest";

import { getFirstName } from "./get-first-name";

describe("getFirstName", () => {
    it("should return empty string for null", () => {
        expect(getFirstName(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
        expect(getFirstName(undefined)).toBe("");
    });

    it("should return empty string for empty string", () => {
        expect(getFirstName("")).toBe("");
    });

    it("should return empty string for whitespace only", () => {
        expect(getFirstName("   ")).toBe("");
        expect(getFirstName("\t\n")).toBe("");
    });

    it("should extract first name from space-separated names", () => {
        expect(getFirstName("John Doe")).toBe("John");
        expect(getFirstName("Mary Jane Watson")).toBe("Mary");
        expect(getFirstName("Jean-Luc Picard")).toBe("Jean");
    });

    it("should extract first name from hyphen-separated names", () => {
        expect(getFirstName("Mary-Jane Watson")).toBe("Mary");
        expect(getFirstName("Jean-Luc")).toBe("Jean");
    });

    it("should extract first name from underscore-separated names", () => {
        expect(getFirstName("John_Doe")).toBe("John");
        expect(getFirstName("Mary_Jane_Watson")).toBe("Mary");
    });

    it("should extract first name from dot-separated names", () => {
        expect(getFirstName("John.Doe")).toBe("John");
        expect(getFirstName("Mary.Jane.Watson")).toBe("Mary");
    });

    it("should extract first name from mixed delimiters", () => {
        expect(getFirstName("John-Doe Smith")).toBe("John");
        expect(getFirstName("Mary_Jane.Watson")).toBe("Mary");
    });

    it("should handle camelCase names", () => {
        expect(getFirstName("johnDoe")).toBe("John");
        expect(getFirstName("maryJaneWatson")).toBe("Mary");
    });

    it("should handle PascalCase names", () => {
        expect(getFirstName("JohnDoe")).toBe("John");
        expect(getFirstName("MaryJaneWatson")).toBe("Mary");
    });

    it("should handle names with leading/trailing whitespace", () => {
        expect(getFirstName("  John Doe  ")).toBe("John");
        expect(getFirstName("\tMary Jane\n")).toBe("Mary");
    });

    it("should handle names with multiple consecutive delimiters", () => {
        expect(getFirstName("John   Doe")).toBe("John");
        expect(getFirstName("Mary---Jane")).toBe("Mary");
        expect(getFirstName("Jean__Luc")).toBe("Jean");
    });

    it("should handle single character names", () => {
        expect(getFirstName("J")).toBe("J");
        expect(getFirstName("j")).toBe("J");
    });

    it("should handle unicode characters", () => {
        expect(getFirstName("José García")).toBe("José");
        expect(getFirstName("François Dupont")).toBe("François");
    });
});

import { describe, expect, it } from "vitest";

import { getFirstTwoCapitalLetters } from "./get-first-two-capital-letters";

describe("getFirstTwoCapitalLetters", () => {
    it("should return null for null", () => {
        expect(getFirstTwoCapitalLetters(null)).toBeNull();
    });

    it("should return null for undefined", () => {
        expect(getFirstTwoCapitalLetters(undefined)).toBeNull();
    });

    it("should return null for empty string", () => {
        expect(getFirstTwoCapitalLetters("")).toBeNull();
    });

    it("should return null for string with no capital letters", () => {
        expect(getFirstTwoCapitalLetters("hello world")).toBeNull();
        expect(getFirstTwoCapitalLetters("123")).toBeNull();
        expect(getFirstTwoCapitalLetters("!@#$%")).toBeNull();
    });

    it("should return string with single capital letter when only one exists", () => {
        expect(getFirstTwoCapitalLetters("Hello")).toBe("H");
        expect(getFirstTwoCapitalLetters("hello World")).toBe("W");
        expect(getFirstTwoCapitalLetters("aBc")).toBe("B");
    });

    it("should return string with first two capital letters", () => {
        expect(getFirstTwoCapitalLetters("Hello World")).toBe("HW");
        expect(getFirstTwoCapitalLetters("John Doe")).toBe("JD");
        expect(getFirstTwoCapitalLetters("ABC")).toBe("AB");
    });

    it("should return first two capital letters in order", () => {
        expect(getFirstTwoCapitalLetters("JavaScript")).toBe("JS");
        expect(getFirstTwoCapitalLetters("TypeScript")).toBe("TS");
        expect(getFirstTwoCapitalLetters("React Native")).toBe("RN");
    });

    it("should return only first two capital letters when multiple exist", () => {
        expect(getFirstTwoCapitalLetters("ABCDEFG")).toBe("AB");
        expect(getFirstTwoCapitalLetters("Hello World Test")).toBe("HW");
    });

    it("should ignore lowercase letters", () => {
        expect(getFirstTwoCapitalLetters("helloWORLD")).toBe("WO");
        expect(getFirstTwoCapitalLetters("aBcDeF")).toBe("BD");
    });

    it("should handle strings with numbers and special characters", () => {
        expect(getFirstTwoCapitalLetters("Hello123World")).toBe("HW");
        expect(getFirstTwoCapitalLetters("Test!@#String")).toBe("TS");
        expect(getFirstTwoCapitalLetters("A1B2C3")).toBe("AB");
    });

    it("should handle strings with spaces", () => {
        expect(getFirstTwoCapitalLetters("Hello World")).toBe("HW");
        expect(getFirstTwoCapitalLetters("  Test  String  ")).toBe("TS");
    });

    it("should handle strings with only one capital letter", () => {
        expect(getFirstTwoCapitalLetters("Hello")).toBe("H");
        expect(getFirstTwoCapitalLetters("testString")).toBe("S");
    });

    it("should handle unicode characters", () => {
        expect(getFirstTwoCapitalLetters("José García")).toBe("JG");
        expect(getFirstTwoCapitalLetters("François Dupont")).toBe("FD");
    });

    it("should handle mixed case strings", () => {
        expect(getFirstTwoCapitalLetters("HeLLo WoRLd")).toBe("HL");
        expect(getFirstTwoCapitalLetters("TeStInG")).toBe("TS");
    });

    it("should handle strings starting with capital letters", () => {
        expect(getFirstTwoCapitalLetters("ABCdef")).toBe("AB");
        expect(getFirstTwoCapitalLetters("XYZ")).toBe("XY");
    });

    it("should handle strings with capital letters at the end", () => {
        expect(getFirstTwoCapitalLetters("helloWORLD")).toBe("WO");
        expect(getFirstTwoCapitalLetters("testABC")).toBe("AB");
    });

    it("should handle very long strings", () => {
        const longString = "A" + "b".repeat(100) + "C" + "d".repeat(100);
        expect(getFirstTwoCapitalLetters(longString)).toBe("AC");
    });

    it("should handle strings with consecutive capital letters", () => {
        expect(getFirstTwoCapitalLetters("HELLO")).toBe("HE");
        expect(getFirstTwoCapitalLetters("WORLD")).toBe("WO");
    });
});

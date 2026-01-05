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

    it("should return first letter of each word uppercased", () => {
        expect(getFirstTwoCapitalLetters("hello world")).toBe("HW");
        expect(getFirstTwoCapitalLetters("max kakacko")).toBe("MK");
    });

    it("should handle strings with numbers", () => {
        expect(getFirstTwoCapitalLetters("123")).toBe("1");
        expect(getFirstTwoCapitalLetters("test 123")).toBe("T1");
    });

    it("should handle strings with only special characters", () => {
        expect(getFirstTwoCapitalLetters("!@#$%")).toBe("!");
    });

    it("should return string with single letter when only one word exists", () => {
        expect(getFirstTwoCapitalLetters("Hello")).toBe("H");
        expect(getFirstTwoCapitalLetters("hello")).toBe("H");
        expect(getFirstTwoCapitalLetters("aBc")).toBe("A");
    });

    it("should return first letter of each word for multiple words", () => {
        expect(getFirstTwoCapitalLetters("hello World")).toBe("HW");
        expect(getFirstTwoCapitalLetters("Hello World")).toBe("HW");
        expect(getFirstTwoCapitalLetters("John Doe")).toBe("JD");
        expect(getFirstTwoCapitalLetters("max kakacko")).toBe("MK");
    });

    it("should return first letter of single word", () => {
        expect(getFirstTwoCapitalLetters("JavaScript")).toBe("J");
        expect(getFirstTwoCapitalLetters("TypeScript")).toBe("T");
        expect(getFirstTwoCapitalLetters("React Native")).toBe("RN");
    });

    it("should return only first two words' initials when multiple words exist", () => {
        expect(getFirstTwoCapitalLetters("Hello World Test")).toBe("HW");
        expect(getFirstTwoCapitalLetters("One Two Three Four")).toBe("OT");
    });

    it("should handle single word regardless of case", () => {
        expect(getFirstTwoCapitalLetters("helloWORLD")).toBe("H");
        expect(getFirstTwoCapitalLetters("aBcDeF")).toBe("A");
    });

    it("should handle strings with numbers and special characters", () => {
        expect(getFirstTwoCapitalLetters("Hello123World")).toBe("H");
        expect(getFirstTwoCapitalLetters("Test String")).toBe("TS");
        expect(getFirstTwoCapitalLetters("A1B2C3")).toBe("A");
    });

    it("should handle strings with spaces", () => {
        expect(getFirstTwoCapitalLetters("Hello World")).toBe("HW");
        expect(getFirstTwoCapitalLetters("  Test  String  ")).toBe("TS");
    });

    it("should handle strings with only one word", () => {
        expect(getFirstTwoCapitalLetters("Hello")).toBe("H");
        expect(getFirstTwoCapitalLetters("testString")).toBe("T");
    });

    it("should handle unicode characters", () => {
        expect(getFirstTwoCapitalLetters("José García")).toBe("JG");
        expect(getFirstTwoCapitalLetters("François Dupont")).toBe("FD");
    });

    it("should handle mixed case strings", () => {
        expect(getFirstTwoCapitalLetters("HeLLo WoRLd")).toBe("HW");
        expect(getFirstTwoCapitalLetters("TeStInG")).toBe("T");
    });

    it("should handle strings starting with any case", () => {
        expect(getFirstTwoCapitalLetters("ABCdef")).toBe("A");
        expect(getFirstTwoCapitalLetters("xyz")).toBe("X");
    });

    it("should handle single word regardless of internal case", () => {
        expect(getFirstTwoCapitalLetters("helloWORLD")).toBe("H");
        expect(getFirstTwoCapitalLetters("testABC")).toBe("T");
    });

    it("should handle very long strings", () => {
        const longString = "A" + "b".repeat(100) + " C" + "d".repeat(100);
        expect(getFirstTwoCapitalLetters(longString)).toBe("AC");
    });

    it("should handle single word strings", () => {
        expect(getFirstTwoCapitalLetters("HELLO")).toBe("H");
        expect(getFirstTwoCapitalLetters("WORLD")).toBe("W");
    });
});

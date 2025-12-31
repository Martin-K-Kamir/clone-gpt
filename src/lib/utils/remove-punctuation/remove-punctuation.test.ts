import { describe, expect, it } from "vitest";

import {
    removePunctuation,
    removePunctuationAdvanced,
    removePunctuationOnly,
} from "./remove-punctuation";

describe("removePunctuation", () => {
    it("should remove common punctuation", () => {
        expect(removePunctuation("Hello, World!")).toBe("Hello World");
    });

    it("should remove special characters", () => {
        expect(removePunctuation("test@example.com")).toBe("testexamplecom");
    });

    it("should keep letters and numbers", () => {
        expect(removePunctuation("abc123")).toBe("abc123");
    });

    it("should keep spaces", () => {
        expect(removePunctuation("hello world")).toBe("hello world");
    });

    it("should handle empty string", () => {
        expect(removePunctuation("")).toBe("");
    });

    it("should handle string with only punctuation", () => {
        expect(removePunctuation("!@#$%")).toBe("");
    });

    it("should handle mixed content", () => {
        expect(removePunctuation("Hello, World! 123")).toBe("Hello World 123");
    });
});

describe("removePunctuationAdvanced", () => {
    it("should remove punctuation including unicode", () => {
        expect(removePunctuationAdvanced("Hello, World!")).toBe("Hello World");
    });

    it("should handle unicode characters", () => {
        expect(removePunctuationAdvanced("Café")).toBe("Café");
    });

    it("should handle accented characters", () => {
        expect(removePunctuationAdvanced("résumé")).toBe("résumé");
    });

    it("should remove punctuation but keep unicode letters", () => {
        expect(removePunctuationAdvanced("Hello, 世界!")).toBe("Hello 世界");
    });

    it("should keep numbers", () => {
        expect(removePunctuationAdvanced("test123")).toBe("test123");
    });

    it("should keep spaces", () => {
        expect(removePunctuationAdvanced("hello world")).toBe("hello world");
    });
});

describe("removePunctuationOnly", () => {
    it("should remove only common punctuation", () => {
        expect(removePunctuationOnly("Hello, World!")).toBe("Hello World");
    });

    it("should remove specified punctuation marks", () => {
        expect(removePunctuationOnly("test@example.com")).toBe(
            "testexamplecom",
        );
    });

    it("should keep letters and numbers", () => {
        expect(removePunctuationOnly("abc123")).toBe("abc123");
    });

    it("should keep spaces", () => {
        expect(removePunctuationOnly("hello world")).toBe("hello world");
    });

    it("should handle brackets", () => {
        expect(removePunctuationOnly("test[value]")).toBe("testvalue");
    });

    it("should handle quotes", () => {
        expect(removePunctuationOnly('test"value"')).toBe("testvalue");
    });

    it("should handle multiple punctuation types", () => {
        expect(removePunctuationOnly("Hello, (World)!")).toBe("Hello World");
    });
});

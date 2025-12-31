import { describe, expect, it } from "vitest";

import { getLanguageExtension } from "./get-language-extension";

describe("getLanguageExtension", () => {
    it("should return null for undefined", () => {
        expect(getLanguageExtension(undefined)).toBeNull();
    });

    it("should return null for null", () => {
        expect(getLanguageExtension(null as any)).toBeNull();
    });

    it("should return null for empty string", () => {
        expect(getLanguageExtension("")).toBeNull();
    });

    it("should extract language from language- prefix", () => {
        expect(getLanguageExtension("language-javascript")).toBe("javascript");
        expect(getLanguageExtension("language-typescript")).toBe("typescript");
        expect(getLanguageExtension("language-python")).toBe("python");
    });

    it("should extract language with underscores", () => {
        expect(getLanguageExtension("language-c_sharp")).toBe("c_sharp");
        expect(getLanguageExtension("language-f_sharp")).toBe("f_sharp");
    });

    it("should extract language with numbers", () => {
        expect(getLanguageExtension("language-cpp")).toBe("cpp");
        expect(getLanguageExtension("language-css3")).toBe("css3");
    });

    it("should return null when language- prefix is not present", () => {
        expect(getLanguageExtension("javascript")).toBeNull();
        expect(getLanguageExtension("typescript")).toBeNull();
        expect(getLanguageExtension("python")).toBeNull();
    });

    it("should extract single character language", () => {
        expect(getLanguageExtension("language-c")).toBe("c");
        expect(getLanguageExtension("language-r")).toBe("r");
    });

    it("should handle language- at the beginning of string", () => {
        expect(getLanguageExtension("language-js")).toBe("js");
        expect(getLanguageExtension("language-ts")).toBe("ts");
    });

    it("should extract language when language- is in the middle", () => {
        expect(getLanguageExtension("prefix-language-js")).toBe("js");
        expect(getLanguageExtension("some-language-ts")).toBe("ts");
    });

    it("should extract only the first word after language-", () => {
        expect(getLanguageExtension("language-javascript typescript")).toBe(
            "javascript",
        );
        expect(getLanguageExtension("language-python code")).toBe("python");
    });

    it("should handle language with hyphens in the name", () => {
        expect(getLanguageExtension("language-c-sharp")).toBe("c");
        expect(getLanguageExtension("language-f-sharp")).toBe("f");
    });

    it("should extract language even with whitespace before language-", () => {
        expect(getLanguageExtension("  language-js")).toBe("js");
        expect(getLanguageExtension("\tlanguage-ts")).toBe("ts");
    });

    it("should handle whitespace after language-", () => {
        expect(getLanguageExtension("language- js")).toBeNull();
        expect(getLanguageExtension("language- ts")).toBeNull();
    });

    it("should handle case sensitivity", () => {
        expect(getLanguageExtension("language-JavaScript")).toBe("JavaScript");
        expect(getLanguageExtension("language-TypeScript")).toBe("TypeScript");
    });

    it("should handle mixed case", () => {
        expect(getLanguageExtension("language-jS")).toBe("jS");
        expect(getLanguageExtension("language-Ts")).toBe("Ts");
    });

    it("should return null for invalid patterns", () => {
        expect(getLanguageExtension("lang-js")).toBeNull();
        expect(getLanguageExtension("langjs")).toBeNull();
        expect(getLanguageExtension("languagejs")).toBeNull();
    });

    it("should extract language name before special characters", () => {
        expect(getLanguageExtension("language-js!")).toBe("js");
        expect(getLanguageExtension("language-ts@")).toBe("ts");
    });
});

import { describe, expect, it } from "vitest";

import { escapeCSVContent } from "./escape-csv-content";

describe("escapeCSVContent", () => {
    it("should return text as-is when it contains no special characters", () => {
        expect(escapeCSVContent("simple text", ",")).toBe("simple text");
        expect(escapeCSVContent("hello world", ",")).toBe("hello world");
    });

    it("should wrap in quotes when text contains delimiter", () => {
        expect(escapeCSVContent("text,with,commas", ",")).toBe(
            '"text,with,commas"',
        );
        expect(escapeCSVContent("value1;value2", ";")).toBe('"value1;value2"');
        expect(escapeCSVContent("tab\tdelimited", "\t")).toBe(
            '"tab\tdelimited"',
        );
    });

    it("should wrap in quotes and escape quotes when text contains quotes", () => {
        expect(escapeCSVContent('text with "quotes"', ",")).toBe(
            '"text with ""quotes"""',
        );
        expect(escapeCSVContent('"quoted text"', ",")).toBe(
            '"""quoted text"""',
        );
        expect(escapeCSVContent('multiple "quotes" here', ",")).toBe(
            '"multiple ""quotes"" here"',
        );
    });

    it("should wrap in quotes when text contains newlines", () => {
        expect(escapeCSVContent("line1\nline2", ",")).toBe('"line1\nline2"');
        expect(escapeCSVContent("text\nwith\nmultiple\nlines", ",")).toBe(
            '"text\nwith\nmultiple\nlines"',
        );
    });

    it("should escape multiple quotes correctly", () => {
        expect(escapeCSVContent('""""', ",")).toBe('""""""""""');
        expect(escapeCSVContent('text""more""text', ",")).toBe(
            '"text""""more""""text"',
        );
    });

    it("should wrap in quotes when text contains delimiter and quotes", () => {
        expect(escapeCSVContent('text,with "quotes"', ",")).toBe(
            '"text,with ""quotes"""',
        );
        expect(escapeCSVContent('"quoted,text"', ",")).toBe(
            '"""quoted,text"""',
        );
    });

    it("should wrap in quotes when text contains delimiter and newlines", () => {
        expect(escapeCSVContent("text,with\nnewline", ",")).toBe(
            '"text,with\nnewline"',
        );
    });

    it("should wrap in quotes when text contains quotes and newlines", () => {
        expect(escapeCSVContent('text "with"\nnewline', ",")).toBe(
            '"text ""with""\nnewline"',
        );
    });

    it("should wrap in quotes when text contains all special characters", () => {
        expect(escapeCSVContent('text,with "quotes"\nand newline', ",")).toBe(
            '"text,with ""quotes""\nand newline"',
        );
    });

    it("should handle empty string", () => {
        expect(escapeCSVContent("", ",")).toBe("");
    });

    it("should handle different delimiters", () => {
        expect(escapeCSVContent("text;with;semicolon", ";")).toBe(
            '"text;with;semicolon"',
        );
        expect(escapeCSVContent("text|with|pipe", "|")).toBe(
            '"text|with|pipe"',
        );
        expect(escapeCSVContent("text\twith\ttab", "\t")).toBe(
            '"text\twith\ttab"',
        );
    });

    it("should not escape when delimiter is not present", () => {
        expect(escapeCSVContent("simple text", ";")).toBe("simple text");
        expect(escapeCSVContent("simple text", "|")).toBe("simple text");
    });

    it("should handle text that only contains delimiter", () => {
        expect(escapeCSVContent(",", ",")).toBe('","');
        expect(escapeCSVContent(";;;", ";")).toBe('";;;"');
    });

    it("should handle text that only contains quotes", () => {
        expect(escapeCSVContent('"', ",")).toBe('""""');
        expect(escapeCSVContent('""', ",")).toBe('""""""');
    });

    it("should handle text that only contains newlines", () => {
        expect(escapeCSVContent("\n", ",")).toBe('"\n"');
        expect(escapeCSVContent("\n\n", ",")).toBe('"\n\n"');
    });
});

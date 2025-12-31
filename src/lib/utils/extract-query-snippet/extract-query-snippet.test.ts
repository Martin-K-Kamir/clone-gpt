import { describe, expect, it } from "vitest";

import { extractQuerySnippet } from "./extract-query-snippet";

describe("extractQuerySnippet", () => {
    it("should return empty string when content is empty", () => {
        expect(extractQuerySnippet("", "query")).toBe("");
    });

    it("should return first maxLength characters when query is not found", () => {
        const content = "This is a long text that does not contain the query";
        const result = extractQuerySnippet(content, "missing", 20);

        expect(result.length).toBe(20);
        expect(result).toBe("This is a long text ");
    });

    it("should return first maxLength characters when query is not found (default maxLength)", () => {
        const content = "A".repeat(200);
        const result = extractQuerySnippet(content, "missing");

        expect(result.length).toBe(100);
        expect(result).toBe("A".repeat(100));
    });

    it("should return content from start when query is near the beginning", () => {
        const content = "This is a test query in the content";
        const result = extractQuerySnippet(content, "This is", 30);

        expect(result.length).toBe(30);
        expect(result).toBe("This is a test query in the co");
    });

    it("should return content from start when query index is less than 10", () => {
        const content = "Query at start of content here";
        const result = extractQuerySnippet(content, "Query", 50);

        expect(result).toBe("Query at start of content here");
    });

    it("should return content from end when query is near the end", () => {
        const longContent = "A".repeat(50) + " query at the end";
        const result = extractQuerySnippet(longContent, "query", 30);

        expect(result).toContain("query at the end");
        expect(result).toContain("... ");
        expect(result).not.toContain(" ...");
    });

    it("should return content from end when query index + length >= content.length - 20", () => {
        const content = "A".repeat(50) + " query near end";
        const result = extractQuerySnippet(content, "query", 30);

        expect(result).toContain("query near end");
        expect(result.startsWith("... ")).toBe(true);
    });

    it("should return snippet with query in the middle", () => {
        const content = "A".repeat(30) + " query " + "B".repeat(30);
        const result = extractQuerySnippet(content, "query", 20);

        expect(result).toContain("query");
        expect(result.startsWith("... ")).toBe(true);
        expect(result.endsWith(" ...")).toBe(true);
    });

    it("should handle case-insensitive matching", () => {
        const content = "This is a TEST query in the content";
        const result = extractQuerySnippet(content, "test", 20);

        expect(result).toContain("TEST");
    });

    it("should handle uppercase query with lowercase content", () => {
        const content = "this is a test query in the content";
        const result = extractQuerySnippet(content, "TEST", 20);

        expect(result).toContain("test");
    });

    it("should handle mixed case query and content", () => {
        const content = "This Is A Test Query In The Content";
        const result = extractQuerySnippet(content, "tEsT", 20);

        expect(result).toContain("Test");
    });

    it("should use default maxLength of 100", () => {
        const content = "A".repeat(200);
        const result = extractQuerySnippet(content, "missing");

        expect(result.length).toBe(100);
    });

    it("should handle query longer than maxLength", () => {
        const content =
            "A".repeat(20) + " very long query text " + "B".repeat(20);
        const result = extractQuerySnippet(content, "very long query text", 10);

        expect(result).toContain("query");
        expect(result.startsWith("... ")).toBe(true);
        expect(result.endsWith(" ...")).toBe(true);
    });

    it("should handle content shorter than maxLength", () => {
        const content = "Short content with query";
        const result = extractQuerySnippet(content, "query", 100);

        expect(result).toContain("query");
        expect(result.length).toBeLessThanOrEqual(content.length + 4);
    });

    it("should handle multiple occurrences of query (uses first)", () => {
        const content = "First query here and second query there";
        const result = extractQuerySnippet(content, "query", 20);

        expect(result).toContain("First query");
        expect(result).not.toContain("second query");
    });

    it("should handle query at exact boundary conditions", () => {
        const content = "A".repeat(10) + " query " + "B".repeat(20);
        const result = extractQuerySnippet(content, "query", 20);

        expect(result).toContain("query");
    });

    it("should handle empty query", () => {
        const content = "This is some content";
        const result = extractQuerySnippet(content, "", 10);

        expect(result).toBe("This is so");
    });

    it("should preserve original case in output", () => {
        const content = "This Is A Test Query In The Content";
        const result = extractQuerySnippet(content, "test", 20);

        expect(result).toContain("Test");
        expect(result).not.toContain("test");
    });

    it("should handle special characters in query", () => {
        const content = "Content with special chars: @#$% query here";
        const result = extractQuerySnippet(content, "@#$%", 30);

        expect(result).toContain("@#$%");
    });

    it("should handle unicode characters", () => {
        const content = "Content with unicode: 测试 query 测试";
        const result = extractQuerySnippet(content, "测试", 30);

        expect(result).toContain("测试");
    });
});

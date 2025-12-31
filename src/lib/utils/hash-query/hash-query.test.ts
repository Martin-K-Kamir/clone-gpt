import { describe, expect, it } from "vitest";

import { hashQuery } from "./hash-query";

describe("hashQuery", () => {
    it("should return a hash string for a simple query", () => {
        const result = hashQuery("test");
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });

    it("should return consistent hash for the same query", () => {
        const query = "hello world";
        const hash1 = hashQuery(query);
        const hash2 = hashQuery(query);
        expect(hash1).toBe(hash2);
    });

    it("should return different hashes for different queries", () => {
        const hash1 = hashQuery("query1");
        const hash2 = hashQuery("query2");
        expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", () => {
        const result = hashQuery("");
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });

    it("should handle long strings", () => {
        const longString = "a".repeat(1000);
        const result = hashQuery(longString);
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });

    it("should handle special characters", () => {
        const result = hashQuery("!@#$%^&*()");
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });

    it("should handle unicode characters", () => {
        const result = hashQuery("你好世界");
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });

    it("should return base36 string", () => {
        const result = hashQuery("test");
        expect(/^[a-z0-9]+$/i.test(result)).toBe(true);
    });

    it("should handle case-sensitive queries", () => {
        const hash1 = hashQuery("Test");
        const hash2 = hashQuery("test");
        expect(hash1).not.toBe(hash2);
    });

    it("should handle whitespace", () => {
        const hash1 = hashQuery("hello world");
        const hash2 = hashQuery("helloworld");
        expect(hash1).not.toBe(hash2);
    });

    it("should handle numbers", () => {
        const result = hashQuery("12345");
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });

    it("should handle mixed content", () => {
        const result = hashQuery("Hello123!@#World");
        expect(typeof result).toBe("string");
        expect(result.length).toBeLessThanOrEqual(8);
    });
});

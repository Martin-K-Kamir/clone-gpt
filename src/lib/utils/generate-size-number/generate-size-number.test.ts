import { describe, expect, it } from "vitest";

import { generateSizeNumber } from "./generate-size-number";

describe("generateSizeNumber", () => {
    it("should generate number within default range (1-18)", () => {
        const result = generateSizeNumber(0);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(18);
    });

    it("should generate consistent results for same index", () => {
        const result1 = generateSizeNumber(5);
        const result2 = generateSizeNumber(5);
        expect(result1).toBe(result2);
    });

    it("should generate different results for different indices", () => {
        const result1 = generateSizeNumber(0);
        const result2 = generateSizeNumber(1);
        const result3 = generateSizeNumber(2);
        const allSame = result1 === result2 && result2 === result3;
        expect(allSame).toBe(false);
    });

    it("should respect custom min value", () => {
        const result = generateSizeNumber(0, 10);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(18);
    });

    it("should respect custom max value", () => {
        const result = generateSizeNumber(0, 1, 5);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(5);
    });

    it("should respect custom min and max values", () => {
        const result = generateSizeNumber(0, 5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThanOrEqual(10);
    });

    it("should handle zero index", () => {
        const result = generateSizeNumber(0);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(18);
    });

    it("should handle negative index", () => {
        const result = generateSizeNumber(-1);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(18);
    });

    it("should handle large index", () => {
        const result = generateSizeNumber(1000);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(18);
    });

    it("should handle same min and max", () => {
        const result = generateSizeNumber(0, 5, 5);
        expect(result).toBe(5);
    });

    it("should handle range of 1", () => {
        const result = generateSizeNumber(0, 10, 11);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(11);
    });

    it("should generate values across the range", () => {
        const results = Array.from({ length: 100 }, (_, i) =>
            generateSizeNumber(i),
        );
        const minResult = Math.min(...results);
        const maxResult = Math.max(...results);
        expect(minResult).toBeGreaterThanOrEqual(1);
        expect(maxResult).toBeLessThanOrEqual(18);
    });

    it("should handle custom range with many indices", () => {
        const results = Array.from({ length: 50 }, (_, i) =>
            generateSizeNumber(i, 20, 30),
        );
        results.forEach(result => {
            expect(result).toBeGreaterThanOrEqual(20);
            expect(result).toBeLessThanOrEqual(30);
        });
    });

    it("should produce deterministic results", () => {
        const indices = [0, 1, 2, 5, 10, 20, 50, 100];
        const firstRun = indices.map(i => generateSizeNumber(i));
        const secondRun = indices.map(i => generateSizeNumber(i));
        expect(firstRun).toEqual(secondRun);
    });

    it("should handle decimal index", () => {
        const result = generateSizeNumber(1.5);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(18);
    });

    it("should handle very small range", () => {
        const result = generateSizeNumber(0, 1, 2);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(2);
    });
});

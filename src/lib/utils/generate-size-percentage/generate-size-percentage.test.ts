import { describe, expect, it } from "vitest";

import { generateSizePercentage } from "./generate-size-percentage";

describe("generateSizePercentage", () => {
    it("should generate percentage string within default range (60-100)", () => {
        const result = generateSizePercentage(0);
        expect(result).toMatch(/^\d+%$/);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(60);
        expect(number).toBeLessThanOrEqual(100);
    });

    it("should return string ending with %", () => {
        const result = generateSizePercentage(0);
        expect(result).toMatch(/%$/);
    });

    it("should generate consistent results for same index", () => {
        const result1 = generateSizePercentage(5);
        const result2 = generateSizePercentage(5);
        expect(result1).toBe(result2);
    });

    it("should generate different results for different indices", () => {
        const result1 = generateSizePercentage(0);
        const result2 = generateSizePercentage(1);
        const result3 = generateSizePercentage(2);
        const allSame = result1 === result2 && result2 === result3;
        expect(allSame).toBe(false);
    });

    it("should respect custom min value", () => {
        const result = generateSizePercentage(0, 80);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(80);
        expect(number).toBeLessThanOrEqual(100);
    });

    it("should respect custom max value", () => {
        const result = generateSizePercentage(0, 60, 70);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(60);
        expect(number).toBeLessThanOrEqual(70);
    });

    it("should respect custom min and max values", () => {
        const result = generateSizePercentage(0, 50, 75);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(50);
        expect(number).toBeLessThanOrEqual(75);
    });

    it("should handle zero index", () => {
        const result = generateSizePercentage(0);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(60);
        expect(number).toBeLessThanOrEqual(100);
    });

    it("should handle negative index", () => {
        const result = generateSizePercentage(-1);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(60);
        expect(number).toBeLessThanOrEqual(100);
    });

    it("should handle large index", () => {
        const result = generateSizePercentage(1000);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(60);
        expect(number).toBeLessThanOrEqual(100);
    });

    it("should handle same min and max", () => {
        const result = generateSizePercentage(0, 75, 75);
        expect(result).toBe("75%");
    });

    it("should handle range of 1", () => {
        const result = generateSizePercentage(0, 90, 91);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(90);
        expect(number).toBeLessThanOrEqual(91);
    });

    it("should generate values across the range", () => {
        const results = Array.from({ length: 100 }, (_, i) =>
            generateSizePercentage(i),
        );
        const numbers = results.map(r => parseInt(r.replace("%", ""), 10));
        const minResult = Math.min(...numbers);
        const maxResult = Math.max(...numbers);
        expect(minResult).toBeGreaterThanOrEqual(60);
        expect(maxResult).toBeLessThanOrEqual(100);
    });

    it("should handle custom range with many indices", () => {
        const results = Array.from({ length: 50 }, (_, i) =>
            generateSizePercentage(i, 20, 30),
        );
        results.forEach(result => {
            const number = parseInt(result.replace("%", ""), 10);
            expect(number).toBeGreaterThanOrEqual(20);
            expect(number).toBeLessThanOrEqual(30);
            expect(result).toMatch(/%$/);
        });
    });

    it("should produce deterministic results", () => {
        const indices = [0, 1, 2, 5, 10, 20, 50, 100];
        const firstRun = indices.map(i => generateSizePercentage(i));
        const secondRun = indices.map(i => generateSizePercentage(i));
        expect(firstRun).toEqual(secondRun);
    });

    it("should handle decimal index", () => {
        const result = generateSizePercentage(1.5);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(60);
        expect(number).toBeLessThanOrEqual(100);
    });

    it("should handle very small range", () => {
        const result = generateSizePercentage(0, 1, 2);
        const number = parseInt(result.replace("%", ""), 10);
        expect(number).toBeGreaterThanOrEqual(1);
        expect(number).toBeLessThanOrEqual(2);
    });

    it("should format single digit numbers correctly", () => {
        const result = generateSizePercentage(0, 1, 9);
        expect(result).toMatch(/^[1-9]%$/);
    });

    it("should format double digit numbers correctly", () => {
        const result = generateSizePercentage(0, 10, 99);
        expect(result).toMatch(/^\d{2}%$/);
    });
});

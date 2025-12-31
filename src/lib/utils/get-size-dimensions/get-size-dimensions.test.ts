import { describe, expect, it } from "vitest";

import { getSizeDimensions } from "./get-size-dimensions";

describe("getSizeDimensions", () => {
    it("should parse valid size format", () => {
        const result = getSizeDimensions("800x600");
        expect(result.width).toBe(800);
        expect(result.height).toBe(600);
    });

    it("should parse single digit dimensions", () => {
        const result = getSizeDimensions("1x1");
        expect(result.width).toBe(1);
        expect(result.height).toBe(1);
    });

    it("should parse large dimensions", () => {
        const result = getSizeDimensions("1920x1080");
        expect(result.width).toBe(1920);
        expect(result.height).toBe(1080);
    });

    it("should parse very large dimensions", () => {
        const result = getSizeDimensions("9999x9999");
        expect(result.width).toBe(9999);
        expect(result.height).toBe(9999);
    });

    it("should parse decimal numbers as integers", () => {
        const result = getSizeDimensions("800.5x600.7");
        expect(result.width).toBe(800.5);
        expect(result.height).toBe(600.7);
    });

    it("should throw error for invalid format without x", () => {
        expect(() => getSizeDimensions("800600")).toThrow(
            "Invalid size format: 800600",
        );
    });

    it("should throw error for format with only x", () => {
        expect(() => getSizeDimensions("x")).toThrow("Invalid size format: x");
    });

    it("should throw error for format missing width", () => {
        expect(() => getSizeDimensions("x600")).toThrow(
            "Invalid size format: x600",
        );
    });

    it("should throw error for format missing height", () => {
        expect(() => getSizeDimensions("800x")).toThrow(
            "Invalid size format: 800x",
        );
    });

    it("should throw error for empty string", () => {
        expect(() => getSizeDimensions("")).toThrow("Invalid size format: ");
    });

    it("should handle whitespace in dimensions", () => {
        const result = getSizeDimensions(" 800 x 600 ");
        expect(result.width).toBe(800);
        expect(result.height).toBe(600);
    });

    it("should handle negative numbers", () => {
        const result = getSizeDimensions("-800x-600");
        expect(result.width).toBe(-800);
        expect(result.height).toBe(-600);
    });

    it("should handle zero dimensions", () => {
        const result = getSizeDimensions("0x0");
        expect(result.width).toBe(0);
        expect(result.height).toBe(0);
    });
});

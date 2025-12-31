import { describe, expect, it } from "vitest";

import { celsiusToFahrenheit } from "./celsius-to-fahrenheit";

describe("celsiusToFahrenheit", () => {
    it("should convert 0°C to 32°F", () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it("should convert 100°C to 212°F", () => {
        expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it("should convert -40°C to -40°F", () => {
        expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    it("should convert 37°C (body temperature) to 99°F", () => {
        expect(celsiusToFahrenheit(37)).toBe(99);
    });

    it("should convert negative temperatures correctly", () => {
        expect(celsiusToFahrenheit(-20)).toBe(-4);
        expect(celsiusToFahrenheit(-10)).toBe(14);
    });

    it("should round decimal values correctly", () => {
        expect(celsiusToFahrenheit(25.5)).toBe(78);
        expect(celsiusToFahrenheit(25.4)).toBe(78);
        expect(celsiusToFahrenheit(25.6)).toBe(78);
    });

    it("should handle floating point precision", () => {
        expect(celsiusToFahrenheit(20.5)).toBe(69);
        expect(celsiusToFahrenheit(30.7)).toBe(87);
    });

    it("should convert freezing point (0°C) correctly", () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it("should convert boiling point (100°C) correctly", () => {
        expect(celsiusToFahrenheit(100)).toBe(212);
    });
});

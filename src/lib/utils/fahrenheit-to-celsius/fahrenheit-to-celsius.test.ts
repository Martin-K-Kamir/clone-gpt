import { describe, expect, it } from "vitest";

import { fahrenheitToCelsius } from "./fahrenheit-to-celsius";

describe("fahrenheitToCelsius", () => {
    it("should convert 32°F to 0°C", () => {
        expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it("should convert 212°F to 100°C", () => {
        expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it("should convert 0°F to -18°C", () => {
        expect(fahrenheitToCelsius(0)).toBe(-18);
    });

    it("should convert 100°F to 38°C", () => {
        expect(fahrenheitToCelsius(100)).toBe(38);
    });

    it("should convert 77°F to 25°C", () => {
        expect(fahrenheitToCelsius(77)).toBe(25);
    });

    it("should convert -40°F to -40°C", () => {
        expect(fahrenheitToCelsius(-40)).toBe(-40);
    });

    it("should convert 98.6°F to 37°C (body temperature)", () => {
        expect(fahrenheitToCelsius(98.6)).toBe(37);
    });

    it("should convert negative temperatures", () => {
        expect(fahrenheitToCelsius(-4)).toBe(-20);
        expect(fahrenheitToCelsius(-22)).toBe(-30);
    });

    it("should round to nearest integer", () => {
        expect(fahrenheitToCelsius(33.8)).toBe(1);
        expect(fahrenheitToCelsius(33.2)).toBe(1);
        expect(fahrenheitToCelsius(50.5)).toBe(10);
    });

    it("should handle decimal inputs", () => {
        expect(fahrenheitToCelsius(32.9)).toBe(0);
        expect(fahrenheitToCelsius(33.1)).toBe(1);
        expect(fahrenheitToCelsius(100.4)).toBe(38);
    });
});

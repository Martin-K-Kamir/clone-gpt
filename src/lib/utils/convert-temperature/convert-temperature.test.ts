import { describe, expect, it } from "vitest";

import { TEMPERATURE_SYSTEM } from "@/lib/constants";

import { convertTemperature } from "./convert-temperature";

describe("convertTemperature", () => {
    it("should return rounded value when fromSystem equals toSystem", () => {
        expect(
            convertTemperature({
                value: 25.7,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(26);

        expect(
            convertTemperature({
                value: 75.3,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(75);
    });

    it("should convert Celsius to Fahrenheit", () => {
        expect(
            convertTemperature({
                value: 0,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(32);

        expect(
            convertTemperature({
                value: 100,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(212);

        expect(
            convertTemperature({
                value: 25.5,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(79);
    });

    it("should convert Fahrenheit to Celsius", () => {
        expect(
            convertTemperature({
                value: 32,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(0);

        expect(
            convertTemperature({
                value: 212,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(100);

        expect(
            convertTemperature({
                value: 75.5,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(24);
    });

    it("should handle negative temperatures", () => {
        expect(
            convertTemperature({
                value: -40,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(-40);

        expect(
            convertTemperature({
                value: -40,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(-40);

        expect(
            convertTemperature({
                value: -20,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(-4);
    });

    it("should round values before conversion", () => {
        expect(
            convertTemperature({
                value: 25.7,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(79);

        expect(
            convertTemperature({
                value: 75.3,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(24);
    });

    it("should handle body temperature conversion", () => {
        expect(
            convertTemperature({
                value: 37,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(99);

        expect(
            convertTemperature({
                value: 98.6,
                fromSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                toSystem: TEMPERATURE_SYSTEM.CELSIUS,
            }),
        ).toBe(37);
    });

    it("should handle extreme temperatures", () => {
        expect(
            convertTemperature({
                value: -273.15,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(-459);

        expect(
            convertTemperature({
                value: 1000,
                fromSystem: TEMPERATURE_SYSTEM.CELSIUS,
                toSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
            }),
        ).toBe(1832);
    });
});

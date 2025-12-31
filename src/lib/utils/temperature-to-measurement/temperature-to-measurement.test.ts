import { describe, expect, expectTypeOf, it } from "vitest";

import { MEASUREMENT_SYSTEM, TEMPERATURE_SYSTEM } from "@/lib/constants";

import { temperatureToMeasurement } from "./temperature-to-measurement";

describe("temperatureToMeasurement", () => {
    it("should return metric for Celsius", () => {
        const result = temperatureToMeasurement(TEMPERATURE_SYSTEM.CELSIUS);
        expect(result).toBe(MEASUREMENT_SYSTEM.METRIC);
    });

    it("should return imperial for Fahrenheit", () => {
        const result = temperatureToMeasurement(TEMPERATURE_SYSTEM.FAHRENHEIT);
        expect(result).toBe(MEASUREMENT_SYSTEM.IMPERIAL);
    });

    it("should have correct type for Celsius", () => {
        const result = temperatureToMeasurement(TEMPERATURE_SYSTEM.CELSIUS);
        expect(typeof result).toBe("string");
        expect(result).toBe("metric");
    });

    it("should have correct type for Fahrenheit", () => {
        const result = temperatureToMeasurement(TEMPERATURE_SYSTEM.FAHRENHEIT);
        expect(typeof result).toBe("string");
        expect(result).toBe("imperial");
    });

    it("should return consistent results for same input", () => {
        const result1 = temperatureToMeasurement(TEMPERATURE_SYSTEM.CELSIUS);
        const result2 = temperatureToMeasurement(TEMPERATURE_SYSTEM.CELSIUS);
        expect(result1).toBe(result2);
    });

    describe("type tests", () => {
        it("should return metric for Celsius", () => {
            const result = temperatureToMeasurement(TEMPERATURE_SYSTEM.CELSIUS);
            expectTypeOf(result).toEqualTypeOf<"metric">();
        });

        it("should return imperial for Fahrenheit", () => {
            const result = temperatureToMeasurement(
                TEMPERATURE_SYSTEM.FAHRENHEIT,
            );
            expectTypeOf(result).toEqualTypeOf<"imperial">();
        });
    });
});

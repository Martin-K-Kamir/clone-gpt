import { describe, expect, expectTypeOf, it } from "vitest";

import { MEASUREMENT_SYSTEM, TEMPERATURE_SYSTEM } from "@/lib/constants";

import { measurementToTemperature } from "./measurement-to-temperature";

describe("measurementToTemperature", () => {
    it("should return Celsius for metric system", () => {
        const result = measurementToTemperature(MEASUREMENT_SYSTEM.METRIC);
        expect(result).toBe(TEMPERATURE_SYSTEM.CELSIUS);
    });

    it("should return Fahrenheit for imperial system", () => {
        const result = measurementToTemperature(MEASUREMENT_SYSTEM.IMPERIAL);
        expect(result).toBe(TEMPERATURE_SYSTEM.FAHRENHEIT);
    });

    it("should have correct type for metric", () => {
        const result = measurementToTemperature(MEASUREMENT_SYSTEM.METRIC);
        expect(typeof result).toBe("string");
        expect(result).toBe("°C");
    });

    it("should have correct type for imperial", () => {
        const result = measurementToTemperature(MEASUREMENT_SYSTEM.IMPERIAL);
        expect(typeof result).toBe("string");
        expect(result).toBe("°F");
    });

    it("should return consistent results for same input", () => {
        const result1 = measurementToTemperature(MEASUREMENT_SYSTEM.METRIC);
        const result2 = measurementToTemperature(MEASUREMENT_SYSTEM.METRIC);
        expect(result1).toBe(result2);
    });

    describe("type tests", () => {
        it("should return Celsius for metric", () => {
            const result = measurementToTemperature(MEASUREMENT_SYSTEM.METRIC);
            expectTypeOf(result).toEqualTypeOf<"°C">();
        });

        it("should return Fahrenheit for imperial", () => {
            const result = measurementToTemperature(
                MEASUREMENT_SYSTEM.IMPERIAL,
            );
            expectTypeOf(result).toEqualTypeOf<"°F">();
        });
    });
});

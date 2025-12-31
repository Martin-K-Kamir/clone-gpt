import { describe, expect, it } from "vitest";

import {
    TEMPERATURE_SYSTEM,
    TIME_OF_DAY,
    WEATHER_PERIOD,
} from "@/lib/constants";
import type { UIWeatherItem } from "@/lib/types";

import { createWeatherDescription } from "./create-weather-description";

describe("createWeatherDescription", () => {
    const baseItem: UIWeatherItem = {
        timestamp: 1640995200000,
        date: new Date("2022-01-01T12:00:00Z"),
        temp: 20,
        tempMax: 25,
        tempMin: 15,
        description: "clear sky",
        timeOfDay: TIME_OF_DAY.DAY,
        iconCode: "01d",
    };

    describe("CURRENT period", () => {
        it("should create description for current weather during day", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                timeOfDay: TIME_OF_DAY.DAY,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("Weather at");
            expect(description).toContain("degrees");
            expect(description).toContain("Clear sky");
            expect(description).toContain("during the day");
            expect(description).toContain("20");
        });

        it("should create description for current weather at night", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                timeOfDay: TIME_OF_DAY.NIGHT,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("Weather at");
            expect(description).toContain("degrees");
            expect(description).toContain("Clear sky");
            expect(description).toContain("at night");
            expect(description).not.toContain("during the day");
        });

        it("should format time correctly", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                date: new Date("2022-01-01T14:30:00Z"),
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toMatch(/Weather at \d{2}:\d{2}/);
        });

        it("should convert temperature from Celsius to Fahrenheit", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                temp: 20,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("68");
            expect(description).toContain(TEMPERATURE_SYSTEM.FAHRENHEIT);
        });

        it("should convert temperature from Fahrenheit to Celsius", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                temp: 68,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("20");
            expect(description).toContain(TEMPERATURE_SYSTEM.CELSIUS);
        });

        it("should handle string date", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                date: "2022-01-01T12:00:00Z",
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("Weather at");
        });
    });

    describe("UPCOMING period", () => {
        it("should create description for upcoming weather", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                tempMax: 25,
                tempMin: 15,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.UPCOMING,
            });

            expect(description).toContain("Weather for");
            expect(description).toContain("25");
            expect(description).toContain("15");
            expect(description).toContain("degrees");
            expect(description).toContain("Clear sky");
            expect(description).not.toContain("during the day");
            expect(description).not.toContain("at night");
        });

        it("should format day label correctly", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                date: new Date("2022-12-25T12:00:00Z"),
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.UPCOMING,
            });

            expect(description).toMatch(/Weather for \d{1,2}\.\d{1,2}/);
        });

        it("should convert temperature range from Celsius to Fahrenheit", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                tempMax: 25,
                tempMin: 15,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.UPCOMING,
            });

            expect(description).toContain("77");
            expect(description).toContain("59");
            expect(description).toContain(TEMPERATURE_SYSTEM.FAHRENHEIT);
        });

        it("should convert temperature range from Fahrenheit to Celsius", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                tempMax: 77,
                tempMin: 59,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
                period: WEATHER_PERIOD.UPCOMING,
            });

            expect(description).toContain("25");
            expect(description).toContain("15");
            expect(description).toContain(TEMPERATURE_SYSTEM.CELSIUS);
        });

        it("should display tempMax before tempMin", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                tempMax: 30,
                tempMin: 10,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.UPCOMING,
            });

            const maxIndex = description.indexOf("30");
            const minIndex = description.indexOf("10");
            expect(maxIndex).toBeLessThan(minIndex);
        });
    });

    describe("description formatting", () => {
        it("should convert description to title case", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                description: "light rain",
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("Light rain");
        });

        it("should handle uppercase descriptions", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                description: "HEAVY SNOW",
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("Heavy snow");
        });

        it("should handle mixed case descriptions", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                description: "partly Cloudy with Showers",
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("Partly cloudy with showers");
        });
    });

    describe("edge cases", () => {
        it("should handle negative temperatures", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                temp: -10,
                tempMax: -5,
                tempMin: -15,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("-10");
        });

        it("should handle zero temperature", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                temp: 0,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("0");
        });

        it("should handle same temperature system for both", () => {
            const item: UIWeatherItem = {
                ...baseItem,
                temp: 20,
            };

            const description = createWeatherDescription({
                item,
                temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                initialTemperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
                period: WEATHER_PERIOD.CURRENT,
            });

            expect(description).toContain("20");
        });
    });
});

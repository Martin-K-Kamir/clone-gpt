import { describe, expect, it } from "vitest";

import { TIME_OF_DAY } from "@/lib/constants";
import type { UIWeatherItem } from "@/lib/types";

import { groupForecastsByDay } from "./group-forecasts-by-day";

function createWeatherItem(
    date: Date | string,
    temp: number,
    timeOfDay: "d" | "n" = "d",
    description = "Clear sky",
    iconCode = "01d",
): UIWeatherItem {
    return {
        timestamp: new Date(date).getTime(),
        date,
        temp,
        tempMin: temp - 5,
        tempMax: temp + 5,
        timeOfDay,
        description,
        iconCode: iconCode as UIWeatherItem["iconCode"],
    };
}

describe("groupForecastsByDay", () => {
    it("should return empty array for empty forecasts", () => {
        expect(groupForecastsByDay([])).toEqual([]);
    });

    it("should group forecasts by day", () => {
        const date1 = new Date("2024-01-15T10:00:00Z");
        const date2 = new Date("2024-01-15T14:00:00Z");
        const date3 = new Date("2024-01-16T10:00:00Z");

        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date1, 20),
            createWeatherItem(date2, 25),
            createWeatherItem(date3, 18),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result).toHaveLength(2);
    });

    it("should calculate average temperature for grouped forecasts", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date, 20),
            createWeatherItem(new Date(date.getTime() + 3600000), 25),
            createWeatherItem(new Date(date.getTime() + 7200000), 30),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.temp).toBe(25); // (20 + 25 + 30) / 3 = 25
    });

    it("should calculate min and max temperatures", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date, 20),
            createWeatherItem(new Date(date.getTime() + 3600000), 25),
            createWeatherItem(new Date(date.getTime() + 7200000), 15),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.tempMin).toBe(15);
        expect(result[0]?.tempMax).toBe(25);
    });

    it("should prefer day icon over night icon", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date, 20, "n", "Night sky", "01n"),
            createWeatherItem(
                new Date(date.getTime() + 3600000),
                25,
                "d",
                "Day sky",
                "02d",
            ),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.iconCode).toBe("02d");
        expect(result[0]?.description).toBe("Day sky");
    });

    it("should use first forecast icon if no day icon found", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date, 20, "n", "Night sky", "01n"),
            createWeatherItem(
                new Date(date.getTime() + 3600000),
                25,
                "n",
                "Night sky 2",
                "02n",
            ),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.iconCode).toBe("01n");
        expect(result[0]?.description).toBe("Night sky");
    });

    it("should always set timeOfDay to DAY for grouped forecasts", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date, 20, "n"),
            createWeatherItem(new Date(date.getTime() + 3600000), 25, "n"),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.timeOfDay).toBe(TIME_OF_DAY.DAY);
    });

    it("should round temperatures to 1 decimal place", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date, 20.33, "d", "Clear sky", "01d"),
            createWeatherItem(
                new Date(date.getTime() + 3600000),
                25.67,
                "d",
                "Clear sky",
                "01d",
            ),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.temp).toBe(23); // (20.33 + 25.67) / 2 = 23.0
        // tempMin and tempMax are calculated from the actual temps array, not from individual tempMin/tempMax
        expect(result[0]?.tempMin).toBe(20.3); // min(20.33, 25.67) = 20.33, rounded to 20.3
        expect(result[0]?.tempMax).toBe(25.7); // max(20.33, 25.67) = 25.67, rounded to 25.7
    });

    it("should handle single forecast per day", () => {
        const date = new Date("2024-01-15T10:00:00Z");
        const forecasts: UIWeatherItem[] = [createWeatherItem(date, 20)];

        const result = groupForecastsByDay(forecasts);

        expect(result).toHaveLength(1);
        expect(result[0]?.temp).toBe(20);
    });

    it("should handle forecasts with string dates", () => {
        const forecasts: UIWeatherItem[] = [
            createWeatherItem("2024-01-15T10:00:00Z", 20),
            createWeatherItem("2024-01-15T14:00:00Z", 25),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result).toHaveLength(1);
        expect(result[0]?.temp).toBe(22.5);
    });

    it("should handle multiple days with multiple forecasts each", () => {
        const date1 = new Date("2024-01-15T10:00:00Z");
        const date2 = new Date("2024-01-16T10:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date1, 20),
            createWeatherItem(new Date(date1.getTime() + 3600000), 25),
            createWeatherItem(date2, 18),
            createWeatherItem(new Date(date2.getTime() + 3600000), 22),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result).toHaveLength(2);
        expect(result[0]?.temp).toBe(22.5); // (20 + 25) / 2
        expect(result[1]?.temp).toBe(20); // (18 + 22) / 2
    });

    it("should use first forecast's timestamp and date", () => {
        const date1 = new Date("2024-01-15T10:00:00Z");
        const date2 = new Date("2024-01-15T14:00:00Z");
        const forecasts: UIWeatherItem[] = [
            createWeatherItem(date1, 20),
            createWeatherItem(date2, 25),
        ];

        const result = groupForecastsByDay(forecasts);

        expect(result[0]?.timestamp).toBe(date1.getTime());
        expect(result[0]?.date).toEqual(date1);
    });
});

import { TIME_OF_DAY } from "@/lib/constants";
import type { UIWeatherItem } from "@/lib/types";

export function groupForecastsByDay(
    forecasts: UIWeatherItem[],
): UIWeatherItem[] {
    // Group forecasts by day for upcoming period
    const groupedByDay = forecasts.reduce(
        (acc, forecast) => {
            const date = new Date(forecast.date);
            const dayKey = date.toDateString();

            if (!acc[dayKey]) {
                acc[dayKey] = [];
            }
            acc[dayKey].push(forecast);

            return acc;
        },
        {} as Record<string, UIWeatherItem[]>,
    );

    // Transform each day group into a single forecast item
    return Object.values(groupedByDay).map(dayForecasts => {
        // Calculate average temperature
        const avgTemp =
            dayForecasts.reduce((sum, f) => sum + f.temp, 0) /
            dayForecasts.length;

        // Get min and max temperatures
        const temps = dayForecasts.map(f => f.temp);
        const tempMin = Math.min(...temps);
        const tempMax = Math.max(...temps);

        // Get the best day-time icon (prefer day icons over night icons)
        const dayTimeForecast =
            dayForecasts.find(f => f.timeOfDay === TIME_OF_DAY.DAY) ||
            dayForecasts[0];

        // Use the first forecast's timestamp and timeString for the day
        const firstForecast = dayForecasts[0];

        return {
            timestamp: firstForecast.timestamp,
            date: firstForecast.date,
            temp: Math.round(avgTemp * 10) / 10, // Round to 1 decimal place
            tempMin: Math.round(tempMin * 10) / 10,
            tempMax: Math.round(tempMax * 10) / 10,
            timeOfDay: TIME_OF_DAY.DAY, // Always use day time for grouped forecasts
            description: dayTimeForecast.description,
            iconCode: dayTimeForecast.iconCode,
        };
    });
}

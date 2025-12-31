import { z } from "zod";

import { MEASUREMENT_SYSTEM } from "@/lib/constants";
import {
    weatherConditionSchema,
    weatherForecastSchema,
    weatherItemSchema,
} from "@/lib/schemas";
import type { MeasurementSystem } from "@/lib/types";

export type WeatherForecast = z.infer<typeof weatherForecastSchema>;
export type WeatherItem = z.infer<typeof weatherItemSchema>;
export type WeatherCondition = z.infer<typeof weatherConditionSchema>;

type Options = {
    forecastLimit?: number;
    measurementSystem?: MeasurementSystem;
    language?: string;
    abortSignal?: AbortSignal;
};

export async function getWeatherByCity({
    city,
    options,
}: {
    city: string;
    options?: Options;
}) {
    const {
        forecastLimit = 12,
        measurementSystem = MEASUREMENT_SYSTEM.METRIC,
        language = "en",
        abortSignal,
    } = options ?? {};

    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=${measurementSystem}&cnt=${forecastLimit}&lang=${language}`,
        {
            signal: abortSignal,
        },
    );

    if (!res.ok) {
        throw new Error("Failed to fetch weather data");
    }

    const data = await res.json();

    const validatedData = weatherForecastSchema.parse(data);

    return {
        location: {
            ...validatedData.city,
            city: validatedData.city.name,
        },
        list: validatedData.list.map(item => ({
            timestamp: item.dt,
            date: item.dt_txt,
            visibility: item.visibility,
            wind: item.wind,
            clouds: item.clouds,
            pop: item.pop,
            rain: item.rain,
            snow: item.snow,
            timeOfDay: item.sys.pod,
            temp: item.main.temp,
            tempMin: item.main.temp_min,
            tempMax: item.main.temp_max,
            tempKf: item.main.temp_kf,
            feelsLike: item.main.feels_like,
            pressure: item.main.pressure,
            seaLevel: item.main.sea_level,
            grndLevel: item.main.grnd_level,
            humidity: item.main.humidity,
            id: item.weather[0].id,
            title: item.weather[0].main,
            description: item.weather[0].description,
            iconCode: item.weather[0].icon,
        })),
    };
}

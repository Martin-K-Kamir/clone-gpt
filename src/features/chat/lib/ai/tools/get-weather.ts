import { InferUITool, tool } from "ai";
import { z } from "zod";

import {
    TEMPERATURE_SYSTEM,
    TEMPERATURE_SYSTEM_LIST,
    TIME_FORMATS,
    TIME_FORMAT_LIST,
    WEATHER_PERIODS_LIST,
} from "@/lib/constants";
import { temperatureToMeasurement } from "@/lib/utils";

import { getWeatherByCity } from "@/services/weather";

const inputSchema = z.object({
    location: z.object({
        city: z.string(),
        country: z
            .string()
            .describe(
                "The full name of the country. Match the user's language prompt, secondarily based it on the user's location or preference if possible.",
            ),
    }),
    forecastLimit: z
        .number()
        .describe(
            "Number of weather data points to retrieve: 12 for current conditions, 40 for a 5-day forecast, 84 for a 7-day forecast ",
        ),
    temperatureSystem: z
        .enum(TEMPERATURE_SYSTEM_LIST)
        .default(TEMPERATURE_SYSTEM.CELSIUS),
    timeFormat: z
        .enum(TIME_FORMAT_LIST)
        .default(TIME_FORMATS.HOUR_24)
        .describe(
            "Time format: '24h' (e.g., 14:00) or '12h' (e.g., 2:00 PM). Match the user's language prompt, secondarily based it on the user's location or preference if possible.",
        ),
    language: z
        .string()
        .default("en")
        .describe(
            "Language code for weather descriptions (e.g., 'en' for English, 'cz' for Czech, 'de' for German). Match the user's language prompt, secondarily based it on the user's location or preference if possible.",
        ),
    period: z
        .enum(WEATHER_PERIODS_LIST)
        .describe(
            "Weather period: 'current' for present conditions or 'upcoming' for forecasted conditions.",
        ),
});

type Input = z.infer<typeof inputSchema>;

export type GetWeatherTool = InferUITool<typeof getWeather>;

export const getWeather = tool({
    inputSchema,
    description: "Get the weather for a location",
    execute: async (
        {
            location,
            forecastLimit,
            temperatureSystem,
            period,
            timeFormat,
            language,
        }: Input,
        { abortSignal },
    ) => {
        const data = await getWeatherByCity({
            city: location.city,
            options: {
                forecastLimit,
                abortSignal,
                language,
                measurementSystem: temperatureToMeasurement(temperatureSystem),
            },
        });

        return {
            period,
            temperatureSystem,
            timeFormat,
            language,
            forecasts: data.list,
            location: {
                ...data.location,
                country: location.country,
            },
        };
    },
});

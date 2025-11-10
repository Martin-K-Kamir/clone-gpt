import { z } from "zod";

import { TIME_OF_DAY_LIST, WEATHER_ICON_CODES } from "@/lib/constants";

export const weatherIconSchema = z.enum(WEATHER_ICON_CODES);

export const weatherConditionSchema = z.object({
    id: z.number(),
    main: z.string(),
    description: z.string(),
    icon: weatherIconSchema,
});

export const weatherMainSchema = z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    sea_level: z.number(),
    grnd_level: z.number(),
    humidity: z.number(),
    temp_kf: z.number(),
});

export const weatherCloudSchema = z.object({
    all: z.number(),
});

export const weatherWindSchema = z.object({
    speed: z.number(),
    deg: z.number(),
    gust: z.number(),
});

export const weatherRainSchema = z
    .object({
        "3h": z.number(),
    })
    .optional();

export const weatherSnowSchema = z
    .object({
        "3h": z.number(),
    })
    .optional();

export const sysSchema = z.object({
    pod: z.enum(TIME_OF_DAY_LIST),
});

export const weatherItemSchema = z.object({
    dt: z.number(), // Unix timestamp
    visibility: z.number(), // Average visibility in meters
    pop: z.number(), // Probability of precipitation in percentage
    dt_txt: z.string(), // Date time as ISO string
    main: weatherMainSchema,
    weather: z.array(weatherConditionSchema),
    clouds: weatherCloudSchema,
    wind: weatherWindSchema,
    rain: weatherRainSchema,
    snow: weatherSnowSchema,
    sys: sysSchema,
});

export const weatherLocationSchema = z.object({
    id: z.number(),
    name: z.string(),
    country: z.string(),
    timezone: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
});

export const weatherForecastSchema = z.object({
    list: z.array(weatherItemSchema),
    city: weatherLocationSchema,
});

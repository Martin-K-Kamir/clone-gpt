import {
    CHAT_MESSAGE_TYPE,
    CHAT_TOOL,
} from "../../../src/features/chat/lib/constants";
import type { UIAssistantChatMessage } from "../../../src/features/chat/lib/types";
import {
    TEMPERATURE_SYSTEM,
    TIME_FORMATS,
    TIME_OF_DAY,
    WEATHER_PERIOD,
} from "../../../src/lib/constants";
import type {
    UIWeatherItem,
    WeatherIconCode,
    WeatherPeriod,
} from "../../../src/lib/types";

export const DEFAULT_WEATHER_LOCATION = {
    city: "New York",
    country: "United States",
};
export const FIXED_WEATHER_START_DATE = new Date("2024-01-15T12:00:00Z");
export const FIXED_SUNRISE_TIMESTAMP = 1705320000;
export const FIXED_SUNSET_TIMESTAMP = 1705356000;

type WeatherForecastItem = {
    timestamp: number;
    date: string;
    temp: number;
    tempMax: number;
    tempMin: number;
    tempKf: number;
    feelsLike: number;
    description: string;
    timeOfDay: "d" | "n";
    iconCode: WeatherIconCode;
    visibility: number;
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    clouds: {
        all: number;
    };
    pop: number;
    humidity: number;
    pressure: number;
    seaLevel: number;
    grndLevel: number;
    rain: { "3h": number } | undefined;
    snow: { "3h": number } | undefined;
    id: number;
    title: string;
};

export function createMockWeatherForecasts(
    count: number,
    period: WeatherPeriod = WEATHER_PERIOD.CURRENT,
    startDate: Date = FIXED_WEATHER_START_DATE,
): WeatherForecastItem[] {
    const forecasts: WeatherForecastItem[] = [];
    const descriptions = [
        "clear sky",
        "few clouds",
        "scattered clouds",
        "broken clouds",
        "shower rain",
        "rain",
        "thunderstorm",
        "snow",
        "mist",
    ];
    const weatherTitles = [
        "Clear",
        "Clouds",
        "Clouds",
        "Clouds",
        "Rain",
        "Rain",
        "Thunderstorm",
        "Snow",
        "Mist",
    ];
    const iconCodes = [
        "01d",
        "02d",
        "03d",
        "04d",
        "09d",
        "10d",
        "11d",
        "13d",
        "50d",
    ] as const;
    const weatherIds = [800, 801, 802, 803, 520, 500, 200, 600, 701];

    const getTemperature = (index: number): number => {
        const baseTemp = 22;
        const variation = Math.sin((index / count) * Math.PI * 2) * 5;
        return Math.round((baseTemp + variation) * 10) / 10;
    };

    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        if (period === WEATHER_PERIOD.CURRENT) {
            date.setHours(date.getHours() + i);
        } else {
            date.setDate(date.getDate() + i);
            date.setHours(12, 0, 0, 0);
        }

        const temp = getTemperature(i);
        const tempVariation = (i % 5) + 2;
        const tempMax = Math.round((temp + tempVariation) * 10) / 10;
        const tempMin = Math.round((temp - tempVariation) * 10) / 10;

        const description = descriptions[i % descriptions.length];
        const iconCode = iconCodes[i % iconCodes.length];
        const timeOfDay =
            date.getHours() >= 6 && date.getHours() < 18
                ? TIME_OF_DAY.DAY
                : TIME_OF_DAY.NIGHT;

        const finalIconCode = iconCode.replace(
            /[dn]$/,
            timeOfDay,
        ) as WeatherIconCode;

        const weatherIndex = i % descriptions.length;
        const hasPrecipitation = weatherIndex >= 4 && weatherIndex <= 6;

        forecasts.push({
            timestamp: Math.floor(date.getTime() / 1000),
            date: date.toISOString(),
            temp,
            tempMax,
            tempMin,
            tempKf: 0,
            feelsLike: temp + (i % 3) - 1,
            description,
            timeOfDay,
            iconCode: finalIconCode,
            visibility: 10000 - (i % 3) * 1000,
            wind: {
                speed: 5 + (i % 5),
                deg: (i * 45) % 360,
                gust: 7 + (i % 3),
            },
            clouds: {
                all: (i % 10) * 10,
            },
            pop: hasPrecipitation ? (i % 5) * 20 : 0,
            humidity: 50 + (i % 20),
            pressure: 1013 + (i % 10) - 5,
            seaLevel: 1013 + (i % 10) - 5,
            grndLevel: 1010 + (i % 10) - 5,
            rain:
                hasPrecipitation && weatherIndex === 4
                    ? { "3h": (i % 5) * 2 }
                    : undefined,
            snow:
                hasPrecipitation && weatherIndex === 7
                    ? { "3h": (i % 3) * 1 }
                    : undefined,
            id: weatherIds[weatherIndex],
            title: weatherTitles[weatherIndex],
        });
    }

    return forecasts;
}

export function createMockWeatherLocation(
    city: string = DEFAULT_WEATHER_LOCATION.city,
    country: string = DEFAULT_WEATHER_LOCATION.country,
) {
    return {
        id: 5128581,
        name: city,
        country,
        city,
        timezone: -18000,
        sunrise: FIXED_SUNRISE_TIMESTAMP,
        sunset: FIXED_SUNSET_TIMESTAMP,
    };
}

export function createMockWeatherToolInput(overrides?: {
    location?: {
        city?: string;
        country?: string;
    };
    forecastLimit?: number;
    period?: WeatherPeriod;
    temperatureSystem?:
        | typeof TEMPERATURE_SYSTEM.CELSIUS
        | typeof TEMPERATURE_SYSTEM.FAHRENHEIT;
    timeFormat?: typeof TIME_FORMATS.HOUR_24 | typeof TIME_FORMATS.HOUR_12;
    language?: string;
}) {
    return {
        location: {
            city: overrides?.location?.city ?? DEFAULT_WEATHER_LOCATION.city,
            country:
                overrides?.location?.country ??
                DEFAULT_WEATHER_LOCATION.country,
        },
        forecastLimit: overrides?.forecastLimit ?? 24,
        period: overrides?.period ?? WEATHER_PERIOD.CURRENT,
        temperatureSystem:
            overrides?.temperatureSystem ?? TEMPERATURE_SYSTEM.CELSIUS,
        timeFormat: overrides?.timeFormat ?? TIME_FORMATS.HOUR_24,
        language: overrides?.language ?? "en",
    };
}

export function createMockWeatherToolOutput(overrides?: {
    city?: string;
    country?: string;
    forecastCount?: number;
    period?: WeatherPeriod;
}) {
    const city = overrides?.city ?? DEFAULT_WEATHER_LOCATION.city;
    const country = overrides?.country ?? DEFAULT_WEATHER_LOCATION.country;
    const forecastCount = overrides?.forecastCount ?? 12;
    const period = overrides?.period ?? WEATHER_PERIOD.CURRENT;

    return {
        location: createMockWeatherLocation(city, country),
        forecasts: createMockWeatherForecasts(
            forecastCount,
            period,
            FIXED_WEATHER_START_DATE,
        ),
        period,
        timeFormat: TIME_FORMATS.HOUR_24,
        temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
        language: "en",
    };
}

export function createMockWeatherToolPart(overrides?: {
    toolCallId?: string;
    state?: "output-available" | "output-error" | "input-required";
    input?: Parameters<typeof createMockWeatherToolInput>[0];
    output?: {
        city?: string;
        country?: string;
        forecastCount?: number;
        period?: WeatherPeriod;
    };
}): UIAssistantChatMessage["parts"][number] {
    const inputOverrides = overrides?.input;
    const outputOverrides = overrides?.output;

    return {
        type: CHAT_TOOL.GET_WEATHER,
        toolCallId: overrides?.toolCallId ?? "weather-1",
        state: (overrides?.state ?? "output-available") as "output-available",
        input: createMockWeatherToolInput(inputOverrides),
        output: createMockWeatherToolOutput(outputOverrides),
    };
}

export function createMockWeatherToolParts(options?: {
    text?: string;
    toolInput?: Parameters<typeof createMockWeatherToolInput>[0];
    toolOutput?: Parameters<typeof createMockWeatherToolOutput>[0];
}): UIAssistantChatMessage["parts"] {
    const text =
        options?.text ??
        `Here's the weather forecast for ${DEFAULT_WEATHER_LOCATION.city}:`;

    return [
        {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text,
        },
        {
            type: CHAT_TOOL.GET_WEATHER,
            toolCallId: "weather-1",
            state: "output-available" as const,
            input: createMockWeatherToolInput(options?.toolInput),
            output: createMockWeatherToolOutput(options?.toolOutput),
        },
    ];
}

export function createMockAssistantMessageWithWeatherParts(options?: {
    text?: string;
    toolInput?: Parameters<typeof createMockWeatherToolInput>[0];
    toolOutput?: Parameters<typeof createMockWeatherToolOutput>[0];
}): UIAssistantChatMessage["parts"] {
    return createMockWeatherToolParts(options);
}

export function createMockWeatherItems(
    count: number,
    period: WeatherPeriod,
    startDate: Date = FIXED_WEATHER_START_DATE,
): UIWeatherItem[] {
    const items: UIWeatherItem[] = [];
    const descriptions = [
        "clear sky",
        "few clouds",
        "scattered clouds",
        "broken clouds",
        "shower rain",
        "rain",
        "thunderstorm",
        "snow",
        "mist",
    ];
    const iconCodes = [
        "01d",
        "02d",
        "03d",
        "04d",
        "09d",
        "10d",
        "11d",
        "13d",
        "50d",
    ] as const;

    const getTemperature = (index: number): number => {
        const baseTemp = 23;
        const variation = Math.sin((index / count) * Math.PI * 2) * 5;
        return Math.round((baseTemp + variation) * 10) / 10;
    };

    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        if (period === WEATHER_PERIOD.CURRENT) {
            date.setHours(date.getHours() + i);
        } else {
            date.setDate(date.getDate() + i);
            date.setHours(12, 0, 0, 0);
        }

        const temp = getTemperature(i);
        const tempVariation = (i % 5) + 2;
        const tempMax = Math.round((temp + tempVariation) * 10) / 10;
        const tempMin = Math.round((temp - tempVariation) * 10) / 10;

        const description = descriptions[i % descriptions.length];
        const iconCode = iconCodes[i % iconCodes.length];
        const timeOfDay =
            date.getHours() >= 6 && date.getHours() < 18
                ? TIME_OF_DAY.DAY
                : TIME_OF_DAY.NIGHT;

        const finalIconCode = iconCode.replace(
            /[dn]$/,
            timeOfDay,
        ) as UIWeatherItem["iconCode"];

        items.push({
            timestamp: Math.floor(date.getTime() / 1000),
            date,
            temp,
            tempMax,
            tempMin,
            description,
            timeOfDay,
            iconCode: finalIconCode,
        });
    }

    return items;
}

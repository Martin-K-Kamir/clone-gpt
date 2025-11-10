import type { WeatherIconCodeDay, WeatherIconCodeNight } from "@/lib/types";
import { objectValuesToTuple } from "@/lib/utils";

import { TIME_OF_DAY } from "./time";

export const TEMPERATURE_SYSTEM = {
    CELSIUS: "°C",
    FAHRENHEIT: "°F",
} as const;

export const TEMPERATURE_SYSTEM_LIST = objectValuesToTuple(TEMPERATURE_SYSTEM);

export const WEATHER_PERIODS = {
    CURRENT: "current",
    UPCOMING: "upcoming",
} as const;

export const WEATHER_PERIODS_LIST = objectValuesToTuple(WEATHER_PERIODS);

export const WEATHER_ICON_BASE_CODES = [
    "01",
    "02",
    "03",
    "04",
    "09",
    "10",
    "11",
    "13",
    "50",
] as const;

export const WEATHER_DAY_ICONS_MAP = {
    "01d": "sun",
    "02d": "sun-behind-cloud",
    "03d": "cloud",
    "04d": "cloud",
    "09d": "cloud-with-rain",
    "10d": "sun-behind-rain-cloud",
    "11d": "cloud-with-lightning",
    "13d": "cloud-with-snow",
    "50d": "fog",
} as const satisfies Record<WeatherIconCodeDay, string>;

export const WEATHER_NIGHT_ICONS_MAP = {
    "01n": "moon",
    "02n": "cloud",
    "03n": "cloud",
    "04n": "cloud",
    "09n": "cloud-with-rain",
    "10n": "cloud-with-rain",
    "11n": "cloud-with-lightning",
    "13n": "cloud-with-snow",
    "50n": "fog",
} as const satisfies Record<WeatherIconCodeNight, string>;

export const WEATHER_ICONS_MAP = {
    ...WEATHER_DAY_ICONS_MAP,
    ...WEATHER_NIGHT_ICONS_MAP,
} as const;

export const WEATHER_ICON_CODES = [
    ...WEATHER_ICON_BASE_CODES.map(code => `${code}${TIME_OF_DAY.DAY}`),
    ...WEATHER_ICON_BASE_CODES.map(code => `${code}${TIME_OF_DAY.NIGHT}`),
] as [WeatherIconCodeDay | WeatherIconCodeNight];

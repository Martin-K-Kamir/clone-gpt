import {
    TEMPERATURE_SYSTEM_LIST,
    WEATHER_ICON_BASE_CODES,
    WEATHER_PERIODS_LIST,
} from "@/lib/constants";

import { DayTime, NightTime, TimeOfDay } from "./time";

export type TemperatureSystem = (typeof TEMPERATURE_SYSTEM_LIST)[number];

export type WeatherIconBaseCode = (typeof WEATHER_ICON_BASE_CODES)[number];

export type WeatherIconCodeDay = `${WeatherIconBaseCode}${DayTime}`;
export type WeatherIconCodeNight = `${WeatherIconBaseCode}${NightTime}`;

export type WeatherIconCode =
    | `${WeatherIconBaseCode}${DayTime}`
    | `${WeatherIconBaseCode}${NightTime}`;

export type WeatherPeriod = (typeof WEATHER_PERIODS_LIST)[number];

export type UIWeatherItem = {
    timestamp: number;
    date: Date | string;
    temp: number;
    tempMax: number;
    tempMin: number;
    description: string;
    timeOfDay: TimeOfDay;
    iconCode: WeatherIconCode;
};

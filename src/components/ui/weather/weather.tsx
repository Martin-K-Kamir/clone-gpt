"use client";

import { memo } from "react";
import { useLocalStorage } from "usehooks-ts";

import { TEMPERATURE_SYSTEM, TIME_FORMATS } from "@/lib/constants";
import type {
    TemperatureSystem,
    TimeFormat,
    UIWeatherItem,
    WeatherPeriod,
} from "@/lib/types";
import { cn } from "@/lib/utils";

import { WeatherLocation } from "./types";
import { WeatherHeader } from "./weather-header";
import { WeatherList } from "./weather-list";

type WeatherProps = {
    location: WeatherLocation;
    forecasts: UIWeatherItem[];
    period: WeatherPeriod;
    temperatureSystem?: TemperatureSystem;
    timeFormat?: TimeFormat;
} & Omit<React.ComponentProps<"section">, "children">;

export function Weather({
    location,
    forecasts,
    period,
    className,
    temperatureSystem: initialTemperatureSystem,
    timeFormat: initialTimeFormat,
    ...props
}: WeatherProps) {
    const [temperatureSystem, setTemperatureSystem] =
        useLocalStorage<TemperatureSystem>(
            "temperatureSystem",
            initialTemperatureSystem || TEMPERATURE_SYSTEM.CELSIUS,
            {
                initializeWithValue: false,
            },
        );
    const [timeFormat, setTimeFormat] = useLocalStorage<TimeFormat>(
        "timeFormat",
        initialTimeFormat || TIME_FORMATS.HOUR_24,
        {
            initializeWithValue: false,
        },
    );

    const handleChangeTemperatureSystem = () => {
        setTemperatureSystem(prev =>
            prev === TEMPERATURE_SYSTEM.CELSIUS
                ? TEMPERATURE_SYSTEM.FAHRENHEIT
                : TEMPERATURE_SYSTEM.CELSIUS,
        );
    };

    const handleChangeTimeFormat = () => {
        setTimeFormat(prev =>
            prev === TIME_FORMATS.HOUR_24
                ? TIME_FORMATS.HOUR_12
                : TIME_FORMATS.HOUR_24,
        );
    };

    return (
        <section
            data-testid="weather-container"
            data-slot="weather-container"
            className={cn("space-y-2", className)}
            aria-labelledby="weather-heading"
            role="region"
            {...props}
        >
            <WeatherHeader
                period={period}
                location={location}
                forecasts={forecasts}
                timeFormat={timeFormat}
                temperatureSystem={temperatureSystem}
                initialTemperatureSystem={initialTemperatureSystem}
                onChangeTemperatureSystem={handleChangeTemperatureSystem}
                onChangeTimeFormat={handleChangeTimeFormat}
            />
            <WeatherList
                period={period}
                forecasts={forecasts}
                temperatureSystem={temperatureSystem}
                timeFormat={timeFormat}
                initialTemperatureSystem={initialTemperatureSystem}
            />
        </section>
    );
}

export const MemoizedWeather = memo(Weather);
export const HardMemoizedWeather = memo(Weather, () => true);

"use client";

import { TEMPERATURE_SYSTEM, WEATHER_PERIODS } from "@/lib/constants";
import type {
    TemperatureSystem,
    TimeFormat,
    UIWeatherItem,
    WeatherPeriod,
} from "@/lib/types";
import { cn, toTitleCase } from "@/lib/utils";
import { convertTemperature } from "@/lib/utils/convert-temperature";

import { WeatherLocation } from "./types";
import { WeatherImage } from "./weather-image";
import { WeatherOptionsDropdown } from "./weather-options-dropdown";

type WeatherHeaderProps = {
    period: WeatherPeriod;
    forecasts: UIWeatherItem[];
    location: WeatherLocation;
    temperatureSystem: TemperatureSystem;
    timeFormat: TimeFormat;
    initialTemperatureSystem?: TemperatureSystem;
    onChangeTemperatureSystem: (unit: TemperatureSystem) => void;
    onChangeTimeFormat: (format: TimeFormat) => void;
} & Omit<React.ComponentProps<"header">, "children">;

export function WeatherHeader({
    period,
    forecasts,
    location,
    temperatureSystem,
    timeFormat,
    className,
    initialTemperatureSystem = TEMPERATURE_SYSTEM.CELSIUS,
    onChangeTemperatureSystem,
    onChangeTimeFormat,
    ...props
}: WeatherHeaderProps) {
    const forecast = forecasts[0];

    const temperature = convertTemperature({
        value: forecast.temp,
        fromSystem: initialTemperatureSystem,
        toSystem: temperatureSystem,
    });

    return (
        <header
            className={cn("flex items-center justify-between", className)}
            {...props}
        >
            <div>
                <h2 className="text-lg font-medium" id="weather-heading">
                    Currently {temperature}
                    {temperatureSystem} · {toTitleCase(forecast.description)}
                </h2>
                <h3 className="text-sm text-zinc-400">
                    {location.city}, {location.country}
                </h3>
            </div>
            <div className="flex items-center gap-2">
                <WeatherImage
                    iconCode={forecast.iconCode}
                    alt={forecast.description}
                    width={28}
                    height={28}
                />
                <WeatherOptionsDropdown
                    temperatureSystem={temperatureSystem}
                    timeFormat={timeFormat}
                    showTimeFormat={period === WEATHER_PERIODS.CURRENT}
                    onChangeTemperatureSystem={onChangeTemperatureSystem}
                    onChangeTimeFormat={onChangeTimeFormat}
                />
            </div>
        </header>
    );
}

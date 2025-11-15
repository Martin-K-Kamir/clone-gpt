"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { TEMPERATURE_SYSTEM, WEATHER_PERIOD } from "@/lib/constants";
import type {
    TemperatureSystem,
    TimeFormat,
    UIWeatherItem,
    WeatherPeriod,
} from "@/lib/types";
import { cn, groupForecastsByDay } from "@/lib/utils";

import { WeatherListItem } from "./weather-list-item";

type WeatherListProps = {
    forecasts: UIWeatherItem[];
    period: WeatherPeriod;
    temperatureSystem: TemperatureSystem;
    timeFormat: TimeFormat;
    initialItemsCount?: number;
    classNameWrapper?: string;
    initialTemperatureSystem?: TemperatureSystem;
} & Omit<React.ComponentProps<"ul">, "children">;

export function WeatherList({
    forecasts,
    period,
    temperatureSystem,
    timeFormat,
    className,
    classNameWrapper,
    initialItemsCount = period === WEATHER_PERIOD.UPCOMING ? 7 : 8,
    initialTemperatureSystem = TEMPERATURE_SYSTEM.CELSIUS,
    ...props
}: WeatherListProps) {
    const [showMore, setShowMore] = useState(false);
    const groupedForecasts =
        period === WEATHER_PERIOD.UPCOMING
            ? groupForecastsByDay(forecasts)
            : forecasts;
    const displayedForecasts = showMore
        ? groupedForecasts
        : groupedForecasts.slice(0, initialItemsCount);
    const canShowMore = groupedForecasts.length > initialItemsCount;

    return (
        <div className={cn("space-y-4", classNameWrapper)}>
            <ul
                className={cn(
                    "divide-y divide-zinc-800 border-b border-zinc-800 text-sm",
                    className,
                )}
                role="list"
                aria-label="Hourly weather forecast"
                {...props}
            >
                {displayedForecasts.map((item, index) => (
                    <WeatherListItem
                        key={item.timestamp}
                        item={item}
                        temperatureSystem={temperatureSystem}
                        timeFormat={timeFormat}
                        index={index}
                        initialTemperatureSystem={initialTemperatureSystem}
                        period={period}
                    />
                ))}
            </ul>

            {canShowMore && (
                <Button
                    onClick={() => setShowMore(!showMore)}
                    size="xs"
                    variant="outline"
                >
                    {showMore ? "Show less" : "Show more"}
                </Button>
            )}
        </div>
    );
}

"use client";

import { TEMPERATURE_SYSTEM, WEATHER_PERIODS } from "@/lib/constants";
import type {
    TemperatureSystem,
    TimeFormat,
    UIWeatherItem,
    WeatherPeriod,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { createWeatherDescription } from "@/lib/utils";

import { WeatherDescription } from "./weather-description";
import { WeatherImage } from "./weather-image";
import { WeatherTemperature } from "./weather-temperature";
import { WeatherTime } from "./weather-time";

type WeatherListItemProps = {
    item: UIWeatherItem;
    period: WeatherPeriod;
    temperatureSystem: TemperatureSystem;
    timeFormat: TimeFormat;
    index: number;
    classNameTime?: string;
    classNameTemperature?: string;
    classNameCondition?: string;
    classNameIcon?: string;
    initialTemperatureSystem?: TemperatureSystem;
} & Omit<React.ComponentProps<"li">, "children">;

export function WeatherListItem({
    item,
    temperatureSystem,
    timeFormat,
    index,
    period,
    className,
    classNameTime,
    classNameTemperature,
    classNameCondition,
    classNameIcon,
    initialTemperatureSystem = TEMPERATURE_SYSTEM.CELSIUS,
    ...props
}: WeatherListItemProps) {
    return (
        <li
            key={item.timestamp}
            className={cn("flex items-center gap-6 py-3.5", className)}
            data-slot="weather-list-item"
            role="listitem"
            aria-label={createWeatherDescription({
                item,
                temperatureSystem,
                initialTemperatureSystem,
                period,
            })}
            aria-describedby={`weather-details-${index}`}
            {...props}
        >
            <WeatherTime
                item={item}
                timeFormat={timeFormat}
                period={period}
                className={classNameTime}
            />

            <div className="flex items-center gap-3" aria-hidden="true">
                <WeatherImage
                    className={classNameIcon}
                    iconCode={item.iconCode}
                    alt={item.description}
                />

                <div>
                    {period === WEATHER_PERIODS.CURRENT && (
                        <WeatherTemperature
                            item={item}
                            temperatureSystem={temperatureSystem}
                            initialTemperatureSystem={initialTemperatureSystem}
                            className={classNameTemperature}
                        />
                    )}

                    {period === WEATHER_PERIODS.UPCOMING && (
                        <>
                            <WeatherTemperature
                                item={item}
                                variant="max"
                                initialTemperatureSystem={
                                    initialTemperatureSystem
                                }
                                temperatureSystem={temperatureSystem}
                                className={classNameTemperature}
                            />
                            <span aria-label="to" role="separator">
                                {" "}
                                -{" "}
                            </span>
                            <WeatherTemperature
                                item={item}
                                variant="min"
                                initialTemperatureSystem={
                                    initialTemperatureSystem
                                }
                                temperatureSystem={temperatureSystem}
                                className={classNameTemperature}
                            />
                        </>
                    )}
                </div>
            </div>

            <WeatherDescription
                item={item}
                id={`weather-details-${index}`}
                className={classNameCondition}
            />
        </li>
    );
}

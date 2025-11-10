"use client";

import type { TemperatureSystem, UIWeatherItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { convertTemperature } from "@/lib/utils/convert-temperature";

type WeatherTemperatureProps = {
    item: UIWeatherItem;
    temperatureSystem: TemperatureSystem;
    initialTemperatureSystem: TemperatureSystem;
    variant?: "default" | "max" | "min";
} & Omit<React.ComponentProps<"span">, "children">;

export function WeatherTemperature({
    item,
    className,
    initialTemperatureSystem,
    temperatureSystem,
    variant = "default",
    ...props
}: WeatherTemperatureProps) {
    const map = {
        default: item.temp,
        max: item.tempMax,
        min: item.tempMin,
    };

    const temp = convertTemperature({
        value: map[variant],
        fromSystem: initialTemperatureSystem,
        toSystem: temperatureSystem,
    });

    return (
        <span className={cn("font-medium", className)} {...props}>
            {temp}
            <span aria-label={`degrees ${temperatureSystem}`}>
                {temperatureSystem}
            </span>
        </span>
    );
}

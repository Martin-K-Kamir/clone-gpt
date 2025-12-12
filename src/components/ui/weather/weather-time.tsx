import { format } from "date-fns";

import { TIME_FORMATS, WEATHER_PERIOD } from "@/lib/constants";
import type { TimeFormat, UIWeatherItem, WeatherPeriod } from "@/lib/types";
import { cn } from "@/lib/utils";

type WeatherTimeProps = {
    item: UIWeatherItem;
    timeFormat: TimeFormat;
    period: WeatherPeriod;
} & Omit<React.ComponentProps<"time">, "children">;

export function WeatherTime({
    item,
    timeFormat,
    period,
    className,
    ...props
}: WeatherTimeProps) {
    const date = new Date(item.date);
    const dayLabel = format(date, "M.d");
    const timeLabel = format(
        date,
        timeFormat === TIME_FORMATS.HOUR_24 ? "HH:mm" : "h:mm a",
    );

    return (
        <time
            className={cn(
                "min-w-12 font-medium",
                timeFormat === TIME_FORMATS.HOUR_24 && "min-w-12",
                timeFormat === TIME_FORMATS.HOUR_12 && "min-w-16",
                className,
            )}
            dateTime={date.toISOString()}
            {...props}
        >
            {period === WEATHER_PERIOD.CURRENT ? timeLabel : dayLabel}
        </time>
    );
}

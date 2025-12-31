import { format } from "date-fns";

import { TIME_OF_DAY, WEATHER_PERIOD } from "@/lib/constants";
import type {
    TemperatureSystem,
    UIWeatherItem,
    WeatherPeriod,
} from "@/lib/types";
import { convertTemperature } from "@/lib/utils/convert-temperature";
import { toTitleCase } from "@/lib/utils/to-title-case";

export function createWeatherDescription({
    item,
    temperatureSystem,
    initialTemperatureSystem,
    period,
}: {
    item: UIWeatherItem;
    temperatureSystem: TemperatureSystem;
    initialTemperatureSystem: TemperatureSystem;
    period: WeatherPeriod;
}) {
    const date = new Date(item.date);
    const dayLabel = format(date, "M.d");
    const timeLabel = format(date, "HH:mm");
    const condition = toTitleCase(item.description);
    const isDay = item.timeOfDay === TIME_OF_DAY.DAY;
    const temp = convertTemperature({
        value: item.temp,
        fromSystem: initialTemperatureSystem,
        toSystem: temperatureSystem,
    });
    const tempMax = convertTemperature({
        value: item.tempMax,
        fromSystem: initialTemperatureSystem,
        toSystem: temperatureSystem,
    });
    const tempMin = convertTemperature({
        value: item.tempMin,
        fromSystem: initialTemperatureSystem,
        toSystem: temperatureSystem,
    });

    const weatherDescription =
        period === WEATHER_PERIOD.CURRENT
            ? `Weather at ${timeLabel}: ${temp} degrees ${temperatureSystem}, ${condition}${isDay ? " during the day" : " at night"}`
            : `Weather for ${dayLabel}: ${tempMax} to ${tempMin} degrees ${temperatureSystem}, ${condition}`;

    return weatherDescription;
}

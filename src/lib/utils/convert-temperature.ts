import { TEMPERATURE_SYSTEM } from "@/lib/constants";
import type { TemperatureSystem } from "@/lib/types";

import { celsiusToFahrenheit } from "./celsius-to-fahrenheit";
import { fahrenheitToCelsius } from "./fahrenheit-to-celsius";

export function convertTemperature({
    value,
    fromSystem,
    toSystem,
}: {
    value: number;
    fromSystem: TemperatureSystem;
    toSystem: TemperatureSystem;
}): number {
    const roundedValue = Math.round(value);

    if (fromSystem === toSystem) {
        return roundedValue;
    }

    if (
        fromSystem === TEMPERATURE_SYSTEM.CELSIUS &&
        toSystem === TEMPERATURE_SYSTEM.FAHRENHEIT
    ) {
        return celsiusToFahrenheit(roundedValue);
    }

    if (
        fromSystem === TEMPERATURE_SYSTEM.FAHRENHEIT &&
        toSystem === TEMPERATURE_SYSTEM.CELSIUS
    ) {
        return fahrenheitToCelsius(roundedValue);
    }

    return roundedValue;
}

import { MEASUREMENT_SYSTEM, TEMPERATURE_SYSTEM } from "@/lib/constants";
import type { TemperatureSystem } from "@/lib/types";

type TemperatureToMeasurementMap = {
    [TEMPERATURE_SYSTEM.CELSIUS]: typeof MEASUREMENT_SYSTEM.METRIC;
    [TEMPERATURE_SYSTEM.FAHRENHEIT]: typeof MEASUREMENT_SYSTEM.IMPERIAL;
};

export function temperatureToMeasurement<T extends TemperatureSystem>(
    tempSystem: T,
): TemperatureToMeasurementMap[T] {
    return (
        tempSystem === TEMPERATURE_SYSTEM.CELSIUS
            ? MEASUREMENT_SYSTEM.METRIC
            : MEASUREMENT_SYSTEM.IMPERIAL
    ) as TemperatureToMeasurementMap[T];
}

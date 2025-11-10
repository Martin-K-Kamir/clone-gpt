import { MEASUREMENT_SYSTEM, TEMPERATURE_SYSTEM } from "@/lib/constants";
import type { MeasurementSystem } from "@/lib/types";

type MeasurementToTemperatureMap = {
    [MEASUREMENT_SYSTEM.METRIC]: typeof TEMPERATURE_SYSTEM.CELSIUS;
    [MEASUREMENT_SYSTEM.IMPERIAL]: typeof TEMPERATURE_SYSTEM.FAHRENHEIT;
};

export function measurementToTemperature<T extends MeasurementSystem>(
    measurementSystem: T,
): MeasurementToTemperatureMap[T] {
    return (
        measurementSystem === MEASUREMENT_SYSTEM.METRIC
            ? TEMPERATURE_SYSTEM.CELSIUS
            : TEMPERATURE_SYSTEM.FAHRENHEIT
    ) as MeasurementToTemperatureMap[T];
}

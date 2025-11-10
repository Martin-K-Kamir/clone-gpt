import {
    MEASUREMENT_SYSTEM_LIST,
    OPERATING_SYSTEM_LIST,
} from "@/lib/constants";

export type MeasurementSystem = (typeof MEASUREMENT_SYSTEM_LIST)[number];

export type OperatingSystem = (typeof OPERATING_SYSTEM_LIST)[number];

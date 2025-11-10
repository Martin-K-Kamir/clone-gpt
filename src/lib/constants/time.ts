import { objectValuesToTuple } from "@/lib/utils";

export const TIME_FORMATS = {
    HOUR_24: "24h",
    HOUR_12: "12h",
} as const;

export const TIME_FORMAT_LIST = objectValuesToTuple(TIME_FORMATS);

export const TIME_OF_DAY = {
    DAY: "d",
    NIGHT: "n",
} as const;

export const TIME_OF_DAY_LIST = [TIME_OF_DAY.DAY, TIME_OF_DAY.NIGHT] as const;

export const TIME_PAST_PERIODS = {
    TODAY: "Today",
    YESTERDAY: "Yesterday",
    LAST_WEEK: "Last Week",
    LAST_MONTH: "Last Month",
    LAST_YEAR: "Last Year",
    OLDER: "Older",
} as const;

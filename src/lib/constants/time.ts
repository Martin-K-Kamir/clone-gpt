import { objectValuesToTuple } from "@/lib/utils/object-values-to-tuple/object-values-to-tuple";

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
    LAST_WEEK: "This Week",
    LAST_MONTH: "This Month",
    LAST_YEAR: "This Year",
    OLDER: "Older",
} as const;

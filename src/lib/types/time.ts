import {
    TIME_FORMAT_LIST,
    TIME_OF_DAY_LIST,
    TIME_PAST_PERIODS,
} from "@/lib/constants";

export type TimeFormat = (typeof TIME_FORMAT_LIST)[number];
export type TimeOfDay = (typeof TIME_OF_DAY_LIST)[number];
export type DayTime = Extract<TimeOfDay, "d">;
export type NightTime = Extract<TimeOfDay, "n">;

export type TimedEntry = {
    createdAt: Date | string;
};
export type TimePastPeriod = keyof typeof TIME_PAST_PERIODS;
export type TimePastPeriodLabel = (typeof TIME_PAST_PERIODS)[TimePastPeriod];
export type TimePastGroupedEntries<TEntry extends TimedEntry | TimedEntry[]> =
    Record<TimePastPeriod, TEntry>;
export type TimePastGroupedLabelEntries<
    TEntry extends TimedEntry | TimedEntry[],
> = Record<TimePastPeriodLabel, TEntry>;

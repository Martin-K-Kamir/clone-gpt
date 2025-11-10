import { TIME_PAST_PERIODS } from "@/lib/constants";
import type { TimePastGroupedLabelEntries, TimedEntry } from "@/lib/types";

export function groupByTimePastPeriods<TEntry extends TimedEntry>(
    entries: TEntry[],
): TimePastGroupedLabelEntries<TEntry[]>;

export function groupByTimePastPeriods<TEntry extends TimedEntry>(
    entries: TEntry[],
    getDate: (entry: TEntry) => Date | string,
): TimePastGroupedLabelEntries<TEntry[]>;

export function groupByTimePastPeriods<TEntry extends TimedEntry>(
    entries: TEntry[],
    now: Date,
    getDate: (entry: TEntry) => Date | string,
): TimePastGroupedLabelEntries<TEntry[]>;

export function groupByTimePastPeriods<TEntry extends TimedEntry>(
    entries: TEntry[],
    arg2?: Date | ((entry: TEntry) => Date | string),
    arg3?: (entry: TEntry) => Date | string,
): Partial<TimePastGroupedLabelEntries<TEntry[]>> {
    const now = arg2 instanceof Date ? arg2 : new Date();
    const getDate: (entry: TEntry) => Date | string =
        typeof arg2 === "function"
            ? arg2
            : (arg3 ?? ((entry: TEntry) => entry.createdAt));

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfLastWeek = new Date(startOfToday);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const startOfLastMonth = new Date(startOfToday);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const startOfLastYear = new Date(startOfToday);
    startOfLastYear.setFullYear(startOfLastYear.getFullYear() - 1);

    const groupedEntries = new Map<string, TEntry[]>();
    const periods = Object.values(TIME_PAST_PERIODS);

    for (let i = 0; i < periods.length; i++) {
        groupedEntries.set(periods[i]!, []);
    }

    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!;
        const rawDate = getDate(entry);
        const date = rawDate instanceof Date ? rawDate : new Date(rawDate);

        let groupKey: string;

        if (date >= startOfToday) {
            groupKey = TIME_PAST_PERIODS.TODAY;
        } else if (date >= startOfYesterday) {
            groupKey = TIME_PAST_PERIODS.YESTERDAY;
        } else if (date >= startOfLastWeek) {
            groupKey = TIME_PAST_PERIODS.LAST_WEEK;
        } else if (date >= startOfLastMonth) {
            groupKey = TIME_PAST_PERIODS.LAST_MONTH;
        } else if (date >= startOfLastYear) {
            groupKey = TIME_PAST_PERIODS.LAST_YEAR;
        } else {
            groupKey = TIME_PAST_PERIODS.OLDER;
        }

        groupedEntries.get(groupKey)!.push(entry);
    }

    const result: Partial<TimePastGroupedLabelEntries<TEntry[]>> = {};
    const entriesArray = Array.from(groupedEntries.entries());

    for (let i = 0; i < entriesArray.length; i++) {
        const [key, value] = entriesArray[i]!;
        if (value.length > 0) {
            result[key as keyof TimePastGroupedLabelEntries<TEntry[]>] = value;
        }
    }

    return result;
}

import { describe, expect, expectTypeOf, it } from "vitest";

import { TIME_PAST_PERIODS } from "@/lib/constants";

import { groupByTimePastPeriods } from "./group-by-time-past-periods";

type TestEntry = {
    id: string;
    createdAt: Date | string;
};

describe("groupByTimePastPeriods", () => {
    const now = new Date("2024-01-15T12:00:00Z");
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    it("should group entries by today", () => {
        const entries: TestEntry[] = [
            { id: "1", createdAt: new Date(now.getTime() - 1000) },
            { id: "2", createdAt: new Date(now.getTime() - 2000) },
        ];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.TODAY]).toHaveLength(2);
        expect(result[TIME_PAST_PERIODS.TODAY]).toEqual(
            expect.arrayContaining(entries),
        );
    });

    it("should group entries by yesterday", () => {
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(12, 0, 0, 0);

        const entries: TestEntry[] = [{ id: "1", createdAt: yesterday }];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.YESTERDAY]).toHaveLength(1);
        expect(result[TIME_PAST_PERIODS.YESTERDAY]?.[0]?.id).toBe("1");
    });

    it("should group entries by last week", () => {
        const lastWeek = new Date(startOfToday);
        lastWeek.setDate(lastWeek.getDate() - 3);

        const entries: TestEntry[] = [{ id: "1", createdAt: lastWeek }];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.LAST_WEEK]).toHaveLength(1);
    });

    it("should group entries by last month", () => {
        const lastMonth = new Date(startOfToday);
        lastMonth.setDate(lastMonth.getDate() - 15);

        const entries: TestEntry[] = [{ id: "1", createdAt: lastMonth }];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.LAST_MONTH]).toHaveLength(1);
    });

    it("should group entries by last year", () => {
        const lastYear = new Date(startOfToday);
        lastYear.setMonth(lastYear.getMonth() - 6);

        const entries: TestEntry[] = [{ id: "1", createdAt: lastYear }];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.LAST_YEAR]).toHaveLength(1);
    });

    it("should group entries by older", () => {
        const older = new Date(startOfToday);
        older.setFullYear(older.getFullYear() - 2);

        const entries: TestEntry[] = [{ id: "1", createdAt: older }];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.OLDER]).toHaveLength(1);
    });

    it("should handle empty entries array", () => {
        const result = groupByTimePastPeriods(
            [] as TestEntry[],
            now,
            entry => entry.createdAt,
        );

        expect(result).toEqual({});
    });

    it("should handle entries with string dates", () => {
        const entries: TestEntry[] = [
            { id: "1", createdAt: now.toISOString() },
        ];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.TODAY]).toHaveLength(1);
    });

    it("should use custom getDate function", () => {
        type CustomEntry = {
            id: string;
            customDate: Date;
            createdAt: Date;
        };

        const customDate = new Date(now.getTime() - 1000);
        const entries: CustomEntry[] = [
            {
                id: "1",
                customDate,
                createdAt: new Date(),
            },
        ];

        const result = groupByTimePastPeriods(
            entries,
            now,
            (entry: CustomEntry) => entry.customDate,
        );

        expect(result[TIME_PAST_PERIODS.TODAY]).toBeDefined();
        expect(result[TIME_PAST_PERIODS.TODAY]).toHaveLength(1);
    });

    it("should not include empty groups in result", () => {
        const entries: TestEntry[] = [
            { id: "1", createdAt: new Date(now.getTime() - 1000) },
        ];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.TODAY]).toBeDefined();
        expect(result[TIME_PAST_PERIODS.YESTERDAY]).toBeUndefined();
    });

    it("should handle multiple entries across different periods", () => {
        const today = new Date(now.getTime() - 1000);
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(12, 0, 0, 0);
        const older = new Date(startOfToday);
        older.setFullYear(older.getFullYear() - 2);

        const entries: TestEntry[] = [
            { id: "1", createdAt: today },
            { id: "2", createdAt: yesterday },
            { id: "3", createdAt: older },
        ];

        const result = groupByTimePastPeriods(
            entries,
            now,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.TODAY]).toHaveLength(1);
        expect(result[TIME_PAST_PERIODS.YESTERDAY]).toHaveLength(1);
        expect(result[TIME_PAST_PERIODS.OLDER]).toHaveLength(1);
    });

    it("should use current date when now is not provided", () => {
        const entries: TestEntry[] = [{ id: "1", createdAt: new Date() }];

        const result = groupByTimePastPeriods(
            entries,
            entry => entry.createdAt,
        );

        expect(result[TIME_PAST_PERIODS.TODAY]).toBeDefined();
    });

    describe("type tests", () => {
        it("should preserve generic type in return value", () => {
            const entries: TestEntry[] = [{ id: "1", createdAt: new Date() }];
            const result = groupByTimePastPeriods(entries);
            expectTypeOf(result).toBeObject();
            if (result[TIME_PAST_PERIODS.TODAY]) {
                expectTypeOf(result[TIME_PAST_PERIODS.TODAY]).toEqualTypeOf<
                    TestEntry[]
                >();
            }
        });

        it("should work with custom getDate function", () => {
            type CustomEntry = {
                id: string;
                customDate: Date;
                createdAt: Date;
            };
            const entries: CustomEntry[] = [
                { id: "1", customDate: new Date(), createdAt: new Date() },
            ];
            const result = groupByTimePastPeriods(
                entries,
                entry => entry.customDate,
            );
            expectTypeOf(result).toBeObject();
        });

        it("should accept entries with TimedEntry constraint", () => {
            const entries: TestEntry[] = [{ id: "1", createdAt: new Date() }];
            groupByTimePastPeriods(entries);
            expectTypeOf(groupByTimePastPeriods<TestEntry>).toBeFunction();
        });
    });
});

import { describe, expect, it } from "vitest";

import { formatDateTime } from "./format-date-time";

describe("formatDateTime", () => {
    it("should format Date object correctly", () => {
        const date = new Date("2024-01-15T14:30:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 2:30 PM");
    });

    it("should format date string correctly", () => {
        const result = formatDateTime("2024-01-15T14:30:00");
        expect(result).toBe("January 15 at 2:30 PM");
    });

    it("should format date with single digit day", () => {
        const date = new Date("2024-01-05T09:15:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 5 at 9:15 AM");
    });

    it("should format date with double digit day", () => {
        const date = new Date("2024-01-25T16:45:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 25 at 4:45 PM");
    });

    it("should format midnight correctly", () => {
        const date = new Date("2024-01-15T00:00:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 12:00 AM");
    });

    it("should format noon correctly", () => {
        const date = new Date("2024-01-15T12:00:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 12:00 PM");
    });

    it("should format different months correctly", () => {
        const dates = [
            {
                date: new Date("2024-02-15T14:30:00"),
                expected: "February 15 at 2:30 PM",
            },
            {
                date: new Date("2024-03-15T14:30:00"),
                expected: "March 15 at 2:30 PM",
            },
            {
                date: new Date("2024-04-15T14:30:00"),
                expected: "April 15 at 2:30 PM",
            },
            {
                date: new Date("2024-05-15T14:30:00"),
                expected: "May 15 at 2:30 PM",
            },
            {
                date: new Date("2024-06-15T14:30:00"),
                expected: "June 15 at 2:30 PM",
            },
            {
                date: new Date("2024-07-15T14:30:00"),
                expected: "July 15 at 2:30 PM",
            },
            {
                date: new Date("2024-08-15T14:30:00"),
                expected: "August 15 at 2:30 PM",
            },
            {
                date: new Date("2024-09-15T14:30:00"),
                expected: "September 15 at 2:30 PM",
            },
            {
                date: new Date("2024-10-15T14:30:00"),
                expected: "October 15 at 2:30 PM",
            },
            {
                date: new Date("2024-11-15T14:30:00"),
                expected: "November 15 at 2:30 PM",
            },
            {
                date: new Date("2024-12-15T14:30:00"),
                expected: "December 15 at 2:30 PM",
            },
        ];

        dates.forEach(({ date, expected }) => {
            expect(formatDateTime(date)).toBe(expected);
        });
    });

    it("should format AM times correctly", () => {
        const date = new Date("2024-01-15T09:30:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 9:30 AM");
    });

    it("should format PM times correctly", () => {
        const date = new Date("2024-01-15T21:30:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 9:30 PM");
    });

    it("should format single digit hours correctly", () => {
        const date = new Date("2024-01-15T01:30:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 1:30 AM");
    });

    it("should format single digit minutes correctly", () => {
        const date = new Date("2024-01-15T14:05:00");
        const result = formatDateTime(date);
        expect(result).toBe("January 15 at 2:05 PM");
    });

    it("should handle ISO date strings", () => {
        const result = formatDateTime("2024-01-15T14:30:00Z");
        expect(result).toContain("January 15");
        expect(result).toContain("at");
    });

    it("should handle date strings without time", () => {
        const result = formatDateTime("2024-01-15");
        expect(result).toContain("January 15");
        expect(result).toContain("at");
    });

    it("should handle different years", () => {
        const date = new Date("2023-01-15T14:30:00");
        const result = formatDateTime(date);
        expect(result).toContain("January 15");
        expect(result).toContain("at");
    });
});

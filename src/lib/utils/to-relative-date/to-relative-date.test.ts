import { describe, expect, it } from "vitest";

import { toRelativeDate } from "./to-relative-date";

describe("toRelativeDate", () => {
    it("should return 'Today' for today's date", () => {
        const today = new Date();
        expect(toRelativeDate(today)).toBe("Today");
    });

    it("should return 'Yesterday' for yesterday's date", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        expect(toRelativeDate(yesterday)).toBe("Yesterday");
    });

    it("should return formatted date for same year", () => {
        const date = new Date();
        date.setMonth(5);
        date.setDate(15);
        const result = toRelativeDate(date);
        expect(result).toMatch(/^\d{1,2} \w{3}$/);
    });

    it("should return formatted date with year for different year", () => {
        const date = new Date("2020-06-15");
        const result = toRelativeDate(date);
        expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
        expect(result).toContain("2020");
    });

    it("should handle date string input", () => {
        const today = new Date().toISOString();
        expect(toRelativeDate(today)).toBe("Today");
    });

    it("should handle timestamp number input", () => {
        const today = Date.now();
        expect(toRelativeDate(today)).toBe("Today");
    });

    it("should handle Date object input", () => {
        const date = new Date("2023-06-15");
        const result = toRelativeDate(date);
        expect(result).toMatch(/^\d{1,2} \w{3}/);
    });

    it("should format date in same year correctly", () => {
        const date = new Date();
        date.setMonth(0);
        date.setDate(1);
        const result = toRelativeDate(date);
        expect(result).toMatch(/^1 \w{3}$/);
    });

    it("should format date in different year correctly", () => {
        const date = new Date("2022-12-25");
        const result = toRelativeDate(date);
        expect(result).toMatch(/^\d{1,2} \w{3} 2022$/);
    });
});

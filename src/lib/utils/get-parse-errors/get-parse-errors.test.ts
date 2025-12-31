import { describe, expect, it } from "vitest";
import { z } from "zod";

import { getParseErrors } from "./get-parse-errors";

describe("getParseErrors", () => {
    it("should extract error messages from single error", () => {
        const schema = z.string().min(5);
        const result = schema.safeParse("abc");

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors).toEqual([
                "String must contain at least 5 character(s)",
            ]);
        }
    });

    it("should extract error messages from multiple errors", () => {
        const schema = z.object({
            name: z.string().min(3),
            age: z.number().min(18),
            email: z.string().email(),
        });
        const result = schema.safeParse({
            name: "ab",
            age: 15,
            email: "invalid",
        });

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors).toContain(
                "String must contain at least 3 character(s)",
            );
        }
    });

    it("should extract error messages from nested object errors", () => {
        const schema = z.object({
            user: z.object({
                name: z.string().min(1),
                age: z.number(),
            }),
        });
        const result = schema.safeParse({
            user: {
                name: "",
                age: "invalid",
            },
        });

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
        }
    });

    it("should extract error messages from array errors", () => {
        const schema = z.array(z.string().min(3));
        const result = schema.safeParse(["ab", "cd"]);

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
        }
    });

    it("should extract error messages from union errors", () => {
        const schema = z.union([z.string(), z.number()]);
        const result = schema.safeParse(true);

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
        }
    });

    it("should extract error messages from custom error messages", () => {
        const schema = z.string().min(5, "Custom error message");
        const result = schema.safeParse("abc");

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors).toEqual(["Custom error message"]);
        }
    });

    it("should handle empty error array", () => {
        const schema = z.string();
        const result = schema.safeParse("valid");

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(Array.isArray(errors)).toBe(true);
        } else {
            expect(result.success).toBe(true);
        }
    });

    it("should extract error messages from enum errors", () => {
        const schema = z.enum(["red", "green", "blue"]);
        const result = schema.safeParse("yellow");

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
        }
    });

    it("should extract error messages from date errors", () => {
        const schema = z.date();
        const result = schema.safeParse("invalid-date");

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
        }
    });

    it("should extract error messages from number errors", () => {
        const schema = z.number().int().positive();
        const result = schema.safeParse(-5);

        if (!result.success) {
            const errors = getParseErrors(result);
            expect(errors.length).toBeGreaterThan(0);
        }
    });
});

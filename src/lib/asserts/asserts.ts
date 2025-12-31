import { z } from "zod";

import { AssertError } from "@/lib/classes";
import type { DateCursor } from "@/lib/types";

export function assertIsValidDateString(
    dateString: string,
    message = "Invalid ISO date string",
): asserts dateString is string {
    const schema = z.string().datetime();
    const result = schema.safeParse(dateString);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsNumber(
    value: unknown,
    message = "Invalid number",
): asserts value is number {
    const schema = z.number().finite();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsNonEmptyString(
    value: unknown,
    message = "Invalid string",
): asserts value is string {
    const schema = z.string().trim().min(1);
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsBoolean(
    value: unknown,
    message = "Invalid boolean",
): asserts value is boolean {
    const schema = z.boolean();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsDate(
    value: unknown,
    message = "Invalid date",
): asserts value is Date {
    const schema = z.date();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsDateCursor(
    value: unknown,
    message = "Invalid date cursor",
): asserts value is DateCursor {
    const schema = z.object({
        date: z.string().datetime({ offset: true }),
        id: z.string().uuid(),
    });
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsEmail(
    value: unknown,
    message = "Invalid email",
): asserts value is string {
    const schema = z.string().email(message);
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

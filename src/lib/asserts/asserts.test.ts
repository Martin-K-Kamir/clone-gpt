import { describe, expect, expectTypeOf, it } from "vitest";

import { AssertError } from "@/lib/classes";
import type { DateCursor } from "@/lib/types";

import {
    assertIsBoolean,
    assertIsDate,
    assertIsDateCursor,
    assertIsEmail,
    assertIsNonEmptyString,
    assertIsNumber,
    assertIsValidDateString,
} from "./asserts";

describe("asserts", () => {
    describe("assertIsValidDateString", () => {
        it("should not throw for valid ISO date strings", () => {
            const validDates = [
                "2024-01-01T00:00:00Z",
                "2024-12-31T23:59:59.999Z",
                "2024-01-01T12:30:45.123Z",
                "2023-06-15T08:00:00.000Z",
            ];

            validDates.forEach(date => {
                expect(() => assertIsValidDateString(date)).not.toThrow();
            });
        });

        it("should throw AssertError for invalid date strings", () => {
            const invalidDates = [
                "not-a-date",
                "2024-01-01",
                "01-01-2024",
                "2024/01/01",
                "",
                "2024-13-01T00:00:00Z", // Invalid month
                "2024-01-32T00:00:00Z", // Invalid day
                "invalid",
            ];

            invalidDates.forEach(date => {
                expect(() => assertIsValidDateString(date)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsValidDateString("invalid");
            }).toThrow("Invalid ISO date string");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom date validation error";
            expect(() => {
                assertIsValidDateString("invalid", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsValidDateString("invalid");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
                expect((error as AssertError).issues?.length).toBeGreaterThan(
                    0,
                );
            }
        });

        it("should accept string type", () => {
            const value: string = "2024-01-01T00:00:00Z";
            expect(() => assertIsValidDateString(value)).not.toThrow();
            expectTypeOf(value).toEqualTypeOf<string>();
        });
    });

    describe("assertIsNumber", () => {
        it("should not throw for valid numbers", () => {
            const validNumbers = [
                0,
                1,
                -1,
                42,
                3.14,
                -3.14,
                1e10,
                Number.MAX_VALUE,
            ];

            validNumbers.forEach(num => {
                expect(() => assertIsNumber(num)).not.toThrow();
            });
        });

        it("should throw AssertError for invalid numbers", () => {
            const invalidNumbers = [
                NaN,
                Infinity,
                -Infinity,
                "123",
                null,
                undefined,
                {},
                [],
                true,
                false,
            ];

            invalidNumbers.forEach(num => {
                expect(() => assertIsNumber(num)).toThrow(AssertError);
            });
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsNumber("not a number");
            }).toThrow("Invalid number");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom number validation error";
            expect(() => {
                assertIsNumber("not a number", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsNumber("not a number");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
            }
        });

        it("should narrow type correctly", () => {
            const value: unknown = 42;
            assertIsNumber(value);
            expectTypeOf(value).toEqualTypeOf<number>();
        });
    });

    describe("assertIsNonEmptyString", () => {
        it("should not throw for valid non-empty strings", () => {
            const validStrings = [
                "a",
                "hello",
                "   text   ",
                "123",
                "special-chars!@#",
            ];

            validStrings.forEach(str => {
                expect(() => assertIsNonEmptyString(str)).not.toThrow();
            });
        });

        it("should throw AssertError for invalid strings", () => {
            const invalidStrings = [
                "",
                "   ", // Only whitespace
                "\t\n", // Only whitespace
                null,
                undefined,
                123,
                {},
                [],
                true,
                false,
            ];

            invalidStrings.forEach(str => {
                expect(() => assertIsNonEmptyString(str)).toThrow(AssertError);
            });
        });

        it("should trim strings before validation", () => {
            expect(() => assertIsNonEmptyString("  hello  ")).not.toThrow();
            expect(() => assertIsNonEmptyString("   ")).toThrow(AssertError);
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsNonEmptyString("");
            }).toThrow("Invalid string");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom string validation error";
            expect(() => {
                assertIsNonEmptyString("", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsNonEmptyString("");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
            }
        });

        it("should narrow type correctly", () => {
            const value: unknown = "hello";
            assertIsNonEmptyString(value);
            expectTypeOf(value).toEqualTypeOf<string>();
        });
    });

    describe("assertIsBoolean", () => {
        it("should not throw for valid booleans", () => {
            expect(() => assertIsBoolean(true)).not.toThrow();
            expect(() => assertIsBoolean(false)).not.toThrow();
        });

        it("should throw AssertError for invalid booleans", () => {
            const invalidBooleans = [
                "true",
                "false",
                "1",
                "0",
                1,
                0,
                null,
                undefined,
                {},
                [],
                "",
            ];

            invalidBooleans.forEach(val => {
                expect(() => assertIsBoolean(val)).toThrow(AssertError);
            });
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsBoolean("true");
            }).toThrow("Invalid boolean");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom boolean validation error";
            expect(() => {
                assertIsBoolean("true", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsBoolean("true");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
            }
        });

        it("should narrow type correctly", () => {
            const value: unknown = true;
            assertIsBoolean(value);
            expectTypeOf(value).toEqualTypeOf<boolean>();
        });
    });

    describe("assertIsDate", () => {
        it("should not throw for valid Date objects", () => {
            const validDates = [
                new Date(),
                new Date("2024-01-01"),
                new Date(2024, 0, 1),
                new Date(0), // Epoch
            ];

            validDates.forEach(date => {
                expect(() => assertIsDate(date)).not.toThrow();
            });
        });

        it("should throw AssertError for invalid dates", () => {
            const invalidDates = [
                "2024-01-01",
                "2024-01-01T00:00:00Z",
                1234567890,
                null,
                undefined,
                {},
                [],
                true,
                false,
                "",
            ];

            invalidDates.forEach(date => {
                expect(() => assertIsDate(date)).toThrow(AssertError);
            });
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDate("2024-01-01");
            }).toThrow("Invalid date");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom date validation error";
            expect(() => {
                assertIsDate("2024-01-01", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsDate("2024-01-01");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
            }
        });

        it("should narrow type correctly", () => {
            const value: unknown = new Date();
            assertIsDate(value);
            expectTypeOf(value).toEqualTypeOf<Date>();
        });
    });

    describe("assertIsDateCursor", () => {
        it("should not throw for valid date cursors", () => {
            const validCursors: DateCursor[] = [
                {
                    date: "2024-01-01T00:00:00Z",
                    id: "550e8400-e29b-41d4-a716-446655440000",
                },
                {
                    date: "2024-12-31T23:59:59.999Z",
                    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                },
            ];

            validCursors.forEach(cursor => {
                expect(() => assertIsDateCursor(cursor)).not.toThrow();
            });
        });

        it("should throw AssertError for invalid date cursors", () => {
            const invalidCursors = [
                { date: "invalid", id: "550e8400-e29b-41d4-a716-446655440000" },
                {
                    date: "2024-01-01T00:00:00Z",
                    id: "invalid-uuid",
                },
                { date: "2024-01-01T00:00:00Z" }, // Missing id
                { id: "550e8400-e29b-41d4-a716-446655440000" }, // Missing date
                {},
                null,
                undefined,
                "not an object",
                123,
                [],
            ];

            invalidCursors.forEach(cursor => {
                expect(() => assertIsDateCursor(cursor)).toThrow(AssertError);
            });
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDateCursor({});
            }).toThrow("Invalid date cursor");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom date cursor validation error";
            expect(() => {
                assertIsDateCursor({}, customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsDateCursor({});
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
            }
        });

        it("should validate date format with offset requirement", () => {
            const cursorWithoutOffset = {
                date: "2024-01-01T00:00:00", // Missing Z or offset
                id: "550e8400-e29b-41d4-a716-446655440000",
            };

            expect(() => assertIsDateCursor(cursorWithoutOffset)).toThrow(
                AssertError,
            );
        });

        it("should validate UUID format", () => {
            const cursorWithInvalidUUID = {
                date: "2024-01-01T00:00:00Z",
                id: "not-a-uuid",
            };

            expect(() => assertIsDateCursor(cursorWithInvalidUUID)).toThrow(
                AssertError,
            );
        });

        it("should narrow type correctly", () => {
            const value: unknown = {
                date: "2024-01-01T00:00:00Z",
                id: "550e8400-e29b-41d4-a716-446655440000",
            };
            assertIsDateCursor(value);
            expectTypeOf(value).toEqualTypeOf<DateCursor>();
        });
    });

    describe("assertIsEmail", () => {
        it("should not throw for valid email addresses", () => {
            const validEmails = [
                "test@example.com",
                "user.name@example.com",
                "user+tag@example.co.uk",
                "user_name@example-domain.com",
                "test123@test-domain.org",
                "a@b.co",
            ];

            validEmails.forEach(email => {
                expect(() => assertIsEmail(email)).not.toThrow();
            });
        });

        it("should throw AssertError for invalid email addresses", () => {
            const invalidEmails = [
                "not-an-email",
                "@example.com",
                "user@",
                "user@example",
                "user @example.com",
                "user@example .com",
                "",
                "user@example@com",
                null,
                undefined,
                123,
                {},
                [],
                true,
                false,
            ];

            invalidEmails.forEach(email => {
                expect(() => assertIsEmail(email)).toThrow(AssertError);
            });
        });

        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsEmail("not-an-email");
            }).toThrow("Invalid email");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom email validation error";
            expect(() => {
                assertIsEmail("not-an-email", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsEmail("not-an-email");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
            }
        });

        it("should narrow type correctly", () => {
            const value: unknown = "test@example.com";
            assertIsEmail(value);
            expectTypeOf(value).toEqualTypeOf<string>();
        });
    });
});

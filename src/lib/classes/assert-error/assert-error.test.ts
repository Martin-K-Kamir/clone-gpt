import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import { HTTP_ERROR_STATUS } from "@/lib/constants/http";

import { ASSERT_ERROR_KIND, AssertError } from "./assert-error";

describe("AssertError", () => {
    describe("constructor", () => {
        it("should create an AssertError instance with default message", () => {
            const error = new AssertError();

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(AssertError);
            expect(error.message).toBe("Invalid input data");
            expect(error.kind).toBe(ASSERT_ERROR_KIND);
            expect(error.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(error.name).toBe("AssertError");
            expect(error.issues).toBeUndefined();
            expect(error.error).toBeUndefined();
        });

        it("should create AssertError with custom message", () => {
            const error = new AssertError({
                message: "Custom error message",
            });

            expect(error.message).toBe("Custom error message");
            expect(error.error).toBeUndefined();
        });

        it("should create AssertError with issues", () => {
            const issues: z.ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: ["name"],
                    message: "Expected string, received number",
                },
                {
                    code: "too_small",
                    minimum: 1,
                    type: "number",
                    inclusive: true,
                    path: ["age"],
                    message: "Number must be greater than or equal to 1",
                },
            ];

            const error = new AssertError({ issues });

            expect(error.issues).toEqual(issues);
            expect(error.error).toBe(
                "Expected string, received number, Number must be greater than or equal to 1",
            );
        });

        it("should create AssertError with custom error message", () => {
            const error = new AssertError({
                error: "Custom error string",
            });

            expect(error.error).toBe("Custom error string");
        });

        it("should prioritize custom error over issues", () => {
            const issues: z.ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: ["name"],
                    message: "Expected string, received number",
                },
            ];

            const error = new AssertError({
                error: "Custom error takes precedence",
                issues,
            });

            expect(error.error).toBe("Custom error takes precedence");
            expect(error.issues).toEqual(issues);
        });

        it("should create AssertError with all options", () => {
            const issues: z.ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: ["name"],
                    message: "Invalid type",
                },
            ];

            const error = new AssertError({
                message: "Validation failed",
                error: "Custom error",
                issues,
            });

            expect(error.message).toBe("Validation failed");
            expect(error.error).toBe("Custom error");
            expect(error.issues).toEqual(issues);
        });

        it("should have readonly properties", () => {
            const error = new AssertError();

            expect(error.kind).toBe(ASSERT_ERROR_KIND);
            expect(error.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(error.name).toBe("AssertError");
        });

        it("should always have BAD_REQUEST status", () => {
            const error = new AssertError();

            expect(error.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
        });
    });

    describe("getKind", () => {
        it("should return the ASSERT_ERROR_KIND constant", () => {
            const kind = AssertError.getKind();

            expect(kind).toBe(ASSERT_ERROR_KIND);
            expect(kind).toBe("assert_error");
        });

        it("should be a static method", () => {
            expectTypeOf(AssertError.getKind).toBeFunction();
        });
    });

    describe("error message generation", () => {
        it("should generate error message from issues when error is not provided", () => {
            const issues: z.ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: [],
                    message: "First error",
                },
                {
                    code: "too_small",
                    minimum: 1,
                    type: "number",
                    inclusive: true,
                    path: [],
                    message: "Second error",
                },
            ];

            const error = new AssertError({ issues });

            expect(error.error).toBe("First error, Second error");
        });

        it("should handle empty issues array", () => {
            const error = new AssertError({ issues: [] });

            expect(error.issues).toEqual([]);
            expect(error.error).toBe("");
        });

        it("should handle single issue", () => {
            const issues: z.ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: [],
                    message: "Single error",
                },
            ];

            const error = new AssertError({ issues });

            expect(error.error).toBe("Single error");
        });
    });

    describe("type tests", () => {
        it("should have correct type for issues", () => {
            const error = new AssertError();
            expectTypeOf(error.issues).toEqualTypeOf<
                z.ZodIssue[] | undefined
            >();
        });

        it("should have correct type for error", () => {
            const error = new AssertError();
            expectTypeOf(error.error).toEqualTypeOf<string | undefined>();
        });
    });

    describe("Error inheritance", () => {
        it("should be an instance of Error", () => {
            const error = new AssertError();

            expect(error).toBeInstanceOf(Error);
            expect(error instanceof Error).toBe(true);
        });

        it("should have Error properties", () => {
            const error = new AssertError({
                message: "Test message",
            });

            expect(error.message).toBe("Test message");
            expect(error.stack).toBeDefined();
        });
    });

    describe("edge cases", () => {
        it("should handle empty options object", () => {
            const error = new AssertError({});

            expect(error.message).toBe("Invalid input data");
            expect(error.issues).toBeUndefined();
            expect(error.error).toBeUndefined();
        });

        it("should handle undefined options", () => {
            const error = new AssertError(undefined);

            expect(error.message).toBe("Invalid input data");
            expect(error.issues).toBeUndefined();
            expect(error.error).toBeUndefined();
        });

        it("should handle issues with complex paths", () => {
            const issues: z.ZodIssue[] = [
                {
                    code: "invalid_type",
                    expected: "string",
                    received: "number",
                    path: ["user", "profile", "name"],
                    message: "Nested error",
                },
            ];

            const error = new AssertError({ issues });

            expect(error.issues?.[0].path).toEqual(["user", "profile", "name"]);
            expect(error.error).toBe("Nested error");
        });
    });
});

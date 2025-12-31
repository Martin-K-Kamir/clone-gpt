import { describe, expect, expectTypeOf, it } from "vitest";
import z from "zod";

import { HTTP_ERROR_STATUS } from "@/lib/constants";

import { SessionInvalidError } from "./session-invalid-error";

describe("SessionInvalidError", () => {
    it("should be an instance of Error", () => {
        const error = new SessionInvalidError();

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(SessionInvalidError);
    });

    it("should have correct kind", () => {
        const error = new SessionInvalidError();

        expectTypeOf(error.kind).toEqualTypeOf<"invalid_session">();
        expect(error.kind).toBe("invalid_session");
    });

    it("should have correct status", () => {
        const error = new SessionInvalidError();

        expect(typeof error.status).toBe("number");
        expect(error.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
    });

    it("should use default message when no options provided", () => {
        const error = new SessionInvalidError();

        expect(error.message).toBe("Session is not valid");
    });

    it("should use custom message when provided", () => {
        const customMessage = "Custom session invalid error message";
        const error = new SessionInvalidError({ message: customMessage });

        expect(error.message).toBe(customMessage);
    });

    it("should store issues when provided", () => {
        const mockIssues: z.ZodIssue[] = [
            {
                code: "invalid_type",
                expected: "string",
                received: "number",
                path: ["user", "id"],
                message: "Expected string, received number",
            },
        ];

        const error = new SessionInvalidError({ issues: mockIssues });

        expectTypeOf(error.issues).toEqualTypeOf<z.ZodIssue[] | undefined>();
        expect(error.issues).toEqual(mockIssues);
    });

    it("should set error from issues when provided", () => {
        const mockIssues: z.ZodIssue[] = [
            {
                code: "invalid_type",
                expected: "string",
                received: "number",
                path: ["user", "id"],
                message: "First error",
            },
            {
                code: "invalid_type",
                expected: "string",
                received: "number",
                path: ["user", "name"],
                message: "Second error",
            },
        ];

        const error = new SessionInvalidError({ issues: mockIssues });

        expectTypeOf(error.error).toEqualTypeOf<string | undefined>();
        expect(error.error).toBe("First error, Second error");
    });

    it("should use custom error message when provided", () => {
        const customError = "Custom error string";
        const error = new SessionInvalidError({ error: customError });

        expect(error.error).toBe(customError);
    });

    it("should prioritize custom error over issues", () => {
        const mockIssues: z.ZodIssue[] = [
            {
                code: "invalid_type",
                expected: "string",
                received: "number",
                path: ["user", "id"],
                message: "Issue error",
            },
        ];

        const customError = "Custom error string";
        const error = new SessionInvalidError({
            error: customError,
            issues: mockIssues,
        });

        expect(error.error).toBe(customError);
        expect(error.issues).toEqual(mockIssues);
    });

    it("should handle undefined issues", () => {
        const error = new SessionInvalidError();

        expect(error.issues).toBeUndefined();
        expect(error.error).toBeUndefined();
    });

    it("should handle empty issues array", () => {
        const error = new SessionInvalidError({ issues: [] });

        expect(error.issues).toEqual([]);
        expect(error.error).toBe("");
    });

    it("should have name property", () => {
        const error = new SessionInvalidError();

        expect(typeof error.name).toBe("string");
    });

    it("should be throwable", () => {
        expect(() => {
            throw new SessionInvalidError();
        }).toThrow(SessionInvalidError);
    });

    it("should preserve all properties when thrown", () => {
        const mockIssues: z.ZodIssue[] = [
            {
                code: "invalid_type",
                expected: "string",
                received: "number",
                path: ["user", "id"],
                message: "Test error",
            },
        ];

        try {
            throw new SessionInvalidError({
                message: "Custom message",
                issues: mockIssues,
            });
        } catch (error) {
            expect(error).toBeInstanceOf(SessionInvalidError);
            if (error instanceof SessionInvalidError) {
                expect(error.message).toBe("Custom message");
                expect(error.issues).toEqual(mockIssues);
                expect(error.error).toBe("Test error");
            }
        }
    });

    it("should handle partial options", () => {
        const error = new SessionInvalidError({ message: "Only message" });

        expect(error.message).toBe("Only message");
        expect(error.issues).toBeUndefined();
        expect(error.error).toBeUndefined();
    });
});

import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS } from "@/lib/constants";

import { AuthorizationError } from "./authorization-error";

describe("AuthorizationError", () => {
    it("should be an instance of Error", () => {
        const error = new AuthorizationError();

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AuthorizationError);
    });

    it("should have correct kind", () => {
        const error = new AuthorizationError();

        expectTypeOf(error.kind).toEqualTypeOf<"authorization">();
        expect(error.kind).toBe("authorization");
    });

    it("should have correct status", () => {
        const error = new AuthorizationError();

        expect(typeof error.status).toBe("number");
        expect(error.status).toBe(HTTP_ERROR_STATUS.FORBIDDEN);
    });

    it("should use default message when no message provided", () => {
        const error = new AuthorizationError();

        expect(error.message).toBe(
            "User does not have permission to access this resource",
        );
    });

    it("should use custom message when provided", () => {
        const customMessage = "Custom authorization error message";
        const error = new AuthorizationError(customMessage);

        expect(error.message).toBe(customMessage);
    });

    it("should have name property", () => {
        const error = new AuthorizationError();

        expect(typeof error.name).toBe("string");
    });

    it("should be throwable", () => {
        expect(() => {
            throw new AuthorizationError();
        }).toThrow(AuthorizationError);
    });

    it("should preserve custom message when thrown", () => {
        const customMessage = "Custom error message";

        try {
            throw new AuthorizationError(customMessage);
        } catch (error) {
            expect(error).toBeInstanceOf(AuthorizationError);
            if (error instanceof AuthorizationError) {
                expect(error.message).toBe(customMessage);
            }
        }
    });
});

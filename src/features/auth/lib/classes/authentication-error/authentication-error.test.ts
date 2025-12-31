import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS } from "@/lib/constants";

import { AuthenticationError } from "./authentication-error";

describe("AuthenticationError", () => {
    it("should be an instance of Error", () => {
        const error = new AuthenticationError();

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AuthenticationError);
    });

    it("should have correct kind", () => {
        const error = new AuthenticationError();

        expectTypeOf(error.kind).toEqualTypeOf<"authentication">();
        expect(error.kind).toBe("authentication");
    });

    it("should have correct status", () => {
        const error = new AuthenticationError();

        expect(typeof error.status).toBe("number");
        expect(error.status).toBe(HTTP_ERROR_STATUS.UNAUTHORIZED);
    });

    it("should use default message when no message provided", () => {
        const error = new AuthenticationError();

        expect(error.message).toBe("User is not authenticated");
    });

    it("should use custom message when provided", () => {
        const customMessage = "Custom authentication error message";
        const error = new AuthenticationError(customMessage);

        expect(error.message).toBe(customMessage);
    });

    it("should have name property", () => {
        const error = new AuthenticationError();

        expect(typeof error.name).toBe("string");
    });

    it("should be throwable", () => {
        expect(() => {
            throw new AuthenticationError();
        }).toThrow(AuthenticationError);
    });

    it("should preserve custom message when thrown", () => {
        const customMessage = "Custom error message";

        try {
            throw new AuthenticationError(customMessage);
        } catch (error) {
            expect(error).toBeInstanceOf(AuthenticationError);
            if (error instanceof AuthenticationError) {
                expect(error.message).toBe(customMessage);
            }
        }
    });
});

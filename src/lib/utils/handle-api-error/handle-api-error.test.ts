import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
    AuthorizationError,
    SessionInvalidError,
} from "@/features/auth/lib/classes";

import { api } from "@/lib/api-response";
import { AssertError } from "@/lib/classes";

import { handleApiError, handleApiErrorResponse } from "./handle-api-error";

describe("handleApiError", () => {
    it("should handle AuthorizationError", () => {
        const error = new AuthorizationError("Custom auth error");
        const fallbackError = vi.fn(() => api.error({ message: "Fallback" }));

        const result = handleApiError(error, fallbackError);

        expect(result.success).toBe(false);
        expect(result.status).toBeDefined();
        expect(fallbackError).not.toHaveBeenCalled();
    });

    it("should handle SessionInvalidError", () => {
        const error = new SessionInvalidError({
            message: "Invalid session",
        });
        const fallbackError = vi.fn(() => api.error({ message: "Fallback" }));

        const result = handleApiError(error, fallbackError);

        expect(result.success).toBe(false);
        expect(result.status).toBeDefined();
        expect(fallbackError).not.toHaveBeenCalled();
    });

    it("should handle AssertError", () => {
        const error = new AssertError({
            message: "Assertion failed",
        });
        const fallbackError = vi.fn(() => api.error({ message: "Fallback" }));

        const result = handleApiError(error, fallbackError);

        expect(result.success).toBe(false);
        expect(result.message).toBe("Assertion failed");
        expect(fallbackError).not.toHaveBeenCalled();
    });

    it("should call fallbackError for unknown errors", () => {
        const error = new Error("Unknown error");
        const fallbackResponse = api.error({ message: "Fallback error" });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiError(error, fallbackError);

        expect(result).toBe(fallbackResponse);
        expect(fallbackError).toHaveBeenCalledOnce();
    });

    it("should handle null error", () => {
        const fallbackResponse = api.error({ message: "Fallback error" });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiError(null, fallbackError);

        expect(result).toBe(fallbackResponse);
        expect(fallbackError).toHaveBeenCalledOnce();
    });

    it("should handle string error", () => {
        const fallbackResponse = api.error({ message: "Fallback error" });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiError("String error", fallbackError);

        expect(result).toBe(fallbackResponse);
        expect(fallbackError).toHaveBeenCalledOnce();
    });
});

describe("handleApiErrorResponse", () => {
    it("should handle AuthorizationError and return Response", () => {
        const error = new AuthorizationError("Custom auth error");
        const fallbackResponse = new Response("Fallback", { status: 500 });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiErrorResponse(error, fallbackError);

        expect(result).toBeInstanceOf(Response);
        expect(fallbackError).not.toHaveBeenCalled();
    });

    it("should handle SessionInvalidError and return Response", () => {
        const error = new SessionInvalidError({
            message: "Invalid session",
        });
        const fallbackResponse = new Response("Fallback", { status: 500 });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiErrorResponse(error, fallbackError);

        expect(result).toBeInstanceOf(Response);
        expect(fallbackError).not.toHaveBeenCalled();
    });

    it("should handle AssertError and return Response", () => {
        const error = new AssertError({
            message: "Assertion failed",
        });
        const fallbackResponse = new Response("Fallback", { status: 500 });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiErrorResponse(error, fallbackError);

        expect(result).toBeInstanceOf(Response);
        expect(fallbackError).not.toHaveBeenCalled();
    });

    it("should call fallbackError for unknown errors and return Response", () => {
        const error = new Error("Unknown error");
        const fallbackResponse = new Response("Fallback", { status: 500 });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiErrorResponse(error, fallbackError);

        expect(result).toBe(fallbackResponse);
        expect(fallbackError).toHaveBeenCalledOnce();
    });

    it("should handle null error and return Response", () => {
        const fallbackResponse = new Response("Fallback", { status: 500 });
        const fallbackError = vi.fn(() => fallbackResponse);

        const result = handleApiErrorResponse(null, fallbackError);

        expect(result).toBe(fallbackResponse);
        expect(fallbackError).toHaveBeenCalledOnce();
    });

    describe("type tests", () => {
        it("should preserve generic error type in handleApiError", () => {
            type CustomError = { code: string; message: string };
            const error: CustomError = { code: "ERR001", message: "Error" };
            const fallbackError = () =>
                api.error<CustomError>({ message: "Fallback" });
            const result = handleApiError<CustomError>(error, fallbackError);
            expectTypeOf(result).toBeObject();
        });

        it("should preserve generic error type in handleApiErrorResponse", () => {
            type CustomError = { code: string };
            const error: CustomError = { code: "ERR001" };
            const fallbackError = () =>
                new Response("Fallback", { status: 500 });
            const result = handleApiErrorResponse<CustomError>(
                error,
                fallbackError,
            );
            expectTypeOf(result).toEqualTypeOf<Response>();
        });

        it("should work with default unknown type", () => {
            const error = new Error("Test");
            const fallbackError = () => api.error({ message: "Fallback" });
            const result = handleApiError(error, fallbackError);
            expectTypeOf(result).toBeObject();
        });
    });
});

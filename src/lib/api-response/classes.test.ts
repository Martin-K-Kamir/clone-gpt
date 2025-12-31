import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from "@/lib/constants/http";
import type { HttpErrorStatus, HttpSuccessStatus } from "@/lib/types";

import {
    ApiErrorResponse,
    ApiResponseBase,
    ApiSuccessResponse,
} from "./classes";

describe("ApiResponseBase", () => {
    it("should be defined", () => {
        expect(ApiResponseBase).toBeDefined();
        expect(typeof ApiResponseBase).toBe("function");
    });
});

describe("ApiSuccessResponse", () => {
    describe("constructor", () => {
        it("should create ApiSuccessResponse instance", () => {
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                { id: 1, name: "Test" },
                "test.path",
                "Success message",
            );

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.data).toEqual({ id: 1, name: "Test" });
            expect(response.path).toBe("test.path");
            expect(response.message).toBe("Success message");
            expect(typeof response.timestamp).toBe("number");
        });

        it("should use provided timestamp", () => {
            const timestamp = 1234567890;
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                "data",
                "path",
                "message",
                timestamp,
            );

            expect(response.timestamp).toBe(timestamp);
        });

        it("should default timestamp to Date.now()", () => {
            const before = Date.now();
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                "data",
                "path",
                "message",
            );
            const after = Date.now();

            expect(response.timestamp).toBeGreaterThanOrEqual(before);
            expect(response.timestamp).toBeLessThanOrEqual(after);
        });

        it("should accept different success status codes", () => {
            const statuses: HttpSuccessStatus[] = [
                HTTP_SUCCESS_STATUS.OK,
                HTTP_SUCCESS_STATUS.CREATED,
                HTTP_SUCCESS_STATUS.ACCEPTED,
                HTTP_SUCCESS_STATUS.NO_CONTENT,
            ];

            statuses.forEach(status => {
                const response = new ApiSuccessResponse(
                    status,
                    "data",
                    "path",
                    "message",
                );
                expect(response.status).toBe(status);
            });
        });

        it("should accept different data types", () => {
            const stringData = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                "string",
                "path",
                "message",
            );
            expect(stringData.data).toBe("string");

            const numberData = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                42,
                "path",
                "message",
            );
            expect(numberData.data).toBe(42);

            const objectData = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                { key: "value" },
                "path",
                "message",
            );
            expect(objectData.data).toEqual({ key: "value" });

            const arrayData = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                [1, 2, 3],
                "path",
                "message",
            );
            expect(arrayData.data).toEqual([1, 2, 3]);
        });
    });

    describe("toJson", () => {
        it("should serialize response to JSON string", () => {
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                { id: 1 },
                "test.path",
                "Success",
            );

            const json = response.toJson();
            const parsed = JSON.parse(json);

            expect(parsed.success).toBe(true);
            expect(parsed.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(parsed.data).toEqual({ id: 1 });
            expect(parsed.path).toBe("test.path");
            expect(parsed.message).toBe("Success");
            expect(typeof parsed.timestamp).toBe("number");
        });
    });

    describe("toResponse", () => {
        it("should create Response object with correct status", async () => {
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.CREATED,
                { id: 1 },
                "test.path",
                "Created",
            );

            const httpResponse = response.toResponse();

            expect(httpResponse).toBeInstanceOf(Response);
            expect(httpResponse.status).toBe(HTTP_SUCCESS_STATUS.CREATED);
        });

        it("should create Response with correct JSON body", async () => {
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                { id: 1, name: "Test" },
                "test.path",
                "Success",
            );

            const httpResponse = response.toResponse();
            const body = await httpResponse.json();

            expect(body.success).toBe(true);
            expect(body.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(body.data).toEqual({ id: 1, name: "Test" });
            expect(body.path).toBe("test.path");
            expect(body.message).toBe("Success");
        });
    });

    describe("type tests", () => {
        it("should have correct success type", () => {
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                "data",
                "path",
                "message",
            );
            expectTypeOf(response.success).toEqualTypeOf<true>();
        });

        it("should preserve generic data type", () => {
            type CustomData = { id: number; name: string };
            const response = new ApiSuccessResponse<CustomData>(
                HTTP_SUCCESS_STATUS.OK,
                { id: 1, name: "Test" },
                "path",
                "message",
            );
            expectTypeOf(response.data).toEqualTypeOf<CustomData>();
        });
    });

    describe("inheritance", () => {
        it("should extend ApiResponseBase", () => {
            const response = new ApiSuccessResponse(
                HTTP_SUCCESS_STATUS.OK,
                "data",
                "path",
                "message",
            );

            expect(response).toBeInstanceOf(ApiResponseBase);
            expect(response).toBeInstanceOf(ApiSuccessResponse);
        });
    });
});

describe("ApiErrorResponse", () => {
    describe("constructor", () => {
        it("should create ApiErrorResponse instance without error", () => {
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
            );

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(response.path).toBe("test.path");
            expect(response.message).toBe("Error message");
            expect(response.error).toBeUndefined();
            expect(response.data).toBeUndefined();
            expect(typeof response.timestamp).toBe("number");
        });

        it("should create ApiErrorResponse instance with error", () => {
            const errorDetails = {
                code: "ERROR_001",
                details: "Something went wrong",
            };
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
                errorDetails,
            );

            expect(response.error).toEqual(errorDetails);
        });

        it("should create ApiErrorResponse instance with error and data", () => {
            const errorDetails = { code: "ERROR_001" };
            const data = { requestId: "req-123" };
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
                errorDetails,
                data,
            );

            expect(response.error).toEqual(errorDetails);
            expect(response.data).toEqual(data);
        });

        it("should use provided timestamp", () => {
            const timestamp = 1234567890;
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "path",
                "message",
                undefined,
                undefined,
                timestamp,
            );

            expect(response.timestamp).toBe(timestamp);
        });

        it("should default timestamp to Date.now()", () => {
            const before = Date.now();
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "path",
                "message",
            );
            const after = Date.now();

            expect(response.timestamp).toBeGreaterThanOrEqual(before);
            expect(response.timestamp).toBeLessThanOrEqual(after);
        });

        it("should accept different error status codes", () => {
            const statuses: HttpErrorStatus[] = [
                HTTP_ERROR_STATUS.BAD_REQUEST,
                HTTP_ERROR_STATUS.UNAUTHORIZED,
                HTTP_ERROR_STATUS.NOT_FOUND,
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            ];

            statuses.forEach(status => {
                const response = new ApiErrorResponse(
                    status,
                    "path",
                    "message",
                );
                expect(response.status).toBe(status);
            });
        });
    });

    describe("toJson", () => {
        it("should serialize response to JSON string", () => {
            const errorDetails = { code: "ERROR_001" };
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
                errorDetails,
            );

            const json = response.toJson();
            const parsed = JSON.parse(json);

            expect(parsed.success).toBe(false);
            expect(parsed.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(parsed.path).toBe("test.path");
            expect(parsed.message).toBe("Error message");
            expect(parsed.error).toEqual(errorDetails);
        });
    });

    describe("toResponse", () => {
        it("should create Response object with correct status", async () => {
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.NOT_FOUND,
                "test.path",
                "Not found",
            );

            const httpResponse = response.toResponse();

            expect(httpResponse).toBeInstanceOf(Response);
            expect(httpResponse.status).toBe(HTTP_ERROR_STATUS.NOT_FOUND);
        });

        it("should create Response with correct JSON body", async () => {
            const errorDetails = { code: "ERROR_001" };
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
                errorDetails,
            );

            const httpResponse = response.toResponse();
            const body = await httpResponse.json();

            expect(body.success).toBe(false);
            expect(body.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(body.error).toEqual(errorDetails);
        });
    });

    describe("throw", () => {
        it("should throw ApiErrorResponse when no CustomError provided", () => {
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
            );

            expect(() => {
                response.throw();
            }).toThrow();

            try {
                response.throw();
            } catch (error) {
                expect(error).toBeInstanceOf(ApiErrorResponse);
                const thrown = error as ApiErrorResponse;
                expect(thrown.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
                expect(thrown.message).toBe("Error message");
                expect(thrown.path).toBe("test.path");
            }
        });

        it("should throw CustomError when provided", () => {
            class CustomError extends Error {
                constructor(message: string) {
                    super(message);
                    this.name = "CustomError";
                }
            }

            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
            );

            expect(() => {
                response.throw(CustomError);
            }).toThrow(CustomError);

            try {
                response.throw(CustomError);
            } catch (error) {
                expect(error).toBeInstanceOf(CustomError);
                expect((error as Error).message).toBe("Error message");
            }
        });

        it("should preserve error details when throwing ApiErrorResponse", () => {
            const errorDetails = { code: "ERROR_001" };
            const data = { requestId: "req-123" };
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "test.path",
                "Error message",
                errorDetails,
                data,
            );

            try {
                response.throw();
            } catch (error) {
                const thrown = error as ApiErrorResponse;
                expect(thrown.error).toEqual(errorDetails);
                expect(thrown.data).toEqual(data);
            }
        });
    });

    describe("type tests", () => {
        it("should have correct success type", () => {
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "path",
                "message",
            );
            expectTypeOf(response.success).toEqualTypeOf<false>();
        });

        it("should preserve generic error type", () => {
            type CustomError = { code: string; details: string };
            const response = new ApiErrorResponse<CustomError>(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "path",
                "message",
                { code: "ERR", details: "Details" },
            );
            expectTypeOf(response.error).toEqualTypeOf<
                CustomError | undefined
            >();
        });
    });

    describe("inheritance", () => {
        it("should extend ApiResponseBase", () => {
            const response = new ApiErrorResponse(
                HTTP_ERROR_STATUS.BAD_REQUEST,
                "path",
                "message",
            );

            expect(response).toBeInstanceOf(ApiResponseBase);
            expect(response).toBeInstanceOf(ApiErrorResponse);
        });
    });
});

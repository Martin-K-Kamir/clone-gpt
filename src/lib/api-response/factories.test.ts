import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from "@/lib/constants/http";

import {
    createCustomError,
    createCustomSuccess,
    createErrorFactory,
    createSuccessFactory,
} from "./factories";
import type { ApiErrorResponse, ApiSuccessResponse } from "./responses";

describe("createErrorFactory", () => {
    describe("simple string message", () => {
        it("should create error function for string message", () => {
            const messages = {
                general: "General error message",
            };

            const factory = createErrorFactory(messages);
            const response = factory.general();

            expect(response.success).toBe(false);
            expect(response.status).toBe(
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            );
            expect(response.path).toBe("general");
            expect(response.message).toBe("General error message");
        });

        it("should create error function with error parameter", () => {
            const messages = {
                general: "General error message",
            };

            const factory = createErrorFactory(messages);
            const errorDetails = { code: "ERR_001" };
            const response = factory.general(errorDetails);

            expect(response.error).toEqual(errorDetails);
        });

        it("should create error function with placeholders", () => {
            const messages = {
                upload: "Failed to upload {fileName}",
            };

            const factory = createErrorFactory(messages);
            const response = factory.upload(undefined, {
                fileName: "test.pdf",
            });

            expect(response.message).toBe("Failed to upload test.pdf");
        });

        it("should create error function with error and placeholders", () => {
            const messages = {
                upload: "Failed to upload {fileName}",
            };

            const factory = createErrorFactory(messages);
            const errorDetails = { code: "UPLOAD_ERR" };
            const response = factory.upload(errorDetails, {
                fileName: "test.pdf",
            });

            expect(response.error).toEqual(errorDetails);
            expect(response.message).toBe("Failed to upload test.pdf");
        });
    });

    describe("object message with status", () => {
        it("should create error function for object message", () => {
            const messages = {
                notFound: {
                    message: "Resource not found",
                    status: HTTP_ERROR_STATUS.NOT_FOUND,
                },
            };

            const factory = createErrorFactory(messages);
            const response = factory.notFound();

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.NOT_FOUND);
            expect(response.path).toBe("notFound");
            expect(response.message).toBe("Resource not found");
        });

        it("should create error function with error parameter", () => {
            const messages = {
                validation: {
                    message: "Invalid input",
                    status: HTTP_ERROR_STATUS.BAD_REQUEST,
                },
            };

            const factory = createErrorFactory(messages);
            const errorDetails = { field: "email", reason: "invalid format" };
            const response = factory.validation(errorDetails);

            expect(response.error).toEqual(errorDetails);
            expect(response.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
        });
    });

    describe("nested messages", () => {
        it("should create nested error factory", () => {
            const messages = {
                auth: {
                    signin: "Sign in failed",
                    signup: "Sign up failed",
                },
            };

            const factory = createErrorFactory(messages);

            expect(typeof factory.auth.signin).toBe("function");
            expect(typeof factory.auth.signup).toBe("function");

            const signinResponse = factory.auth.signin();
            expect(signinResponse.path).toBe("auth.signin");
            expect(signinResponse.message).toBe("Sign in failed");

            const signupResponse = factory.auth.signup();
            expect(signupResponse.path).toBe("auth.signup");
            expect(signupResponse.message).toBe("Sign up failed");
        });

        it("should handle deeply nested messages", () => {
            const messages = {
                api: {
                    user: {
                        get: "Failed to get user",
                        update: "Failed to update user",
                    },
                },
            };

            const factory = createErrorFactory(messages);

            const getResponse = factory.api.user.get();
            expect(getResponse.path).toBe("api.user.get");
            expect(getResponse.message).toBe("Failed to get user");

            const updateResponse = factory.api.user.update();
            expect(updateResponse.path).toBe("api.user.update");
            expect(updateResponse.message).toBe("Failed to update user");
        });

        it("should handle mixed nested messages (string and object)", () => {
            const messages = {
                auth: {
                    general: "General auth error",
                    validation: {
                        message: "Invalid credentials",
                        status: HTTP_ERROR_STATUS.BAD_REQUEST,
                    },
                },
            };

            const factory = createErrorFactory(messages);

            const generalResponse = factory.auth.general();
            expect(generalResponse.path).toBe("auth.general");
            expect(generalResponse.message).toBe("General auth error");

            const validationResponse = factory.auth.validation();
            expect(validationResponse.path).toBe("auth.validation");
            expect(validationResponse.message).toBe("Invalid credentials");
            expect(validationResponse.status).toBe(
                HTTP_ERROR_STATUS.BAD_REQUEST,
            );
        });
    });

    describe("path generation", () => {
        it("should generate correct path for top-level message", () => {
            const messages = {
                error: "Error message",
            };

            const factory = createErrorFactory(messages);
            const response = factory.error();

            expect(response.path).toBe("error");
        });

        it("should generate correct path with parentPath", () => {
            const messages = {
                nested: "Nested error",
            };

            const factory = createErrorFactory(messages, "parent");
            const response = factory.nested();

            expect(response.path).toBe("parent.nested");
        });
    });
});

describe("createSuccessFactory", () => {
    describe("simple string message", () => {
        it("should create success function for string message", () => {
            const messages = {
                general: "Success message",
            };

            const factory = createSuccessFactory(messages);
            const response = factory.general("data");

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.path).toBe("general");
            expect(response.message).toBe("Success message");
            expect(response.data).toBe("data");
        });

        it("should create success function with different data types", () => {
            const messages = {
                get: "Retrieved successfully",
            };

            const factory = createSuccessFactory(messages);

            const stringData = factory.get("string");
            expect(stringData.data).toBe("string");

            const objectData = factory.get({ id: 1, name: "Test" });
            expect(objectData.data).toEqual({ id: 1, name: "Test" });

            const arrayData = factory.get([1, 2, 3]);
            expect(arrayData.data).toEqual([1, 2, 3]);
        });

        it("should create success function with placeholders", () => {
            const messages = {
                upload: "Successfully uploaded {fileName}",
            };

            const factory = createSuccessFactory(messages);
            const response = factory.upload("file-id", {
                fileName: "test.pdf",
            });

            expect(response.message).toBe("Successfully uploaded test.pdf");
            expect(response.data).toBe("file-id");
        });
    });

    describe("object message with status", () => {
        it("should create success function for object message", () => {
            const messages = {
                create: {
                    message: "Created successfully",
                    status: HTTP_SUCCESS_STATUS.CREATED,
                },
            };

            const factory = createSuccessFactory(messages);
            const response = factory.create({ id: 1 });

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.CREATED);
            expect(response.path).toBe("create");
            expect(response.message).toBe("Created successfully");
            expect(response.data).toEqual({ id: 1 });
        });

        it("should create success function with placeholders", () => {
            const messages = {
                update: {
                    message: "Updated {count} items",
                    status: HTTP_SUCCESS_STATUS.OK,
                },
            };

            const factory = createSuccessFactory(messages);
            const response = factory.update({ updated: true }, { count: 5 });

            expect(response.message).toBe("Updated 5 items");
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
        });
    });

    describe("nested messages", () => {
        it("should create nested success factory", () => {
            const messages = {
                auth: {
                    signin: "Signed in successfully",
                    signup: "Signed up successfully",
                },
            };

            const factory = createSuccessFactory(messages);

            expect(typeof factory.auth.signin).toBe("function");
            expect(typeof factory.auth.signup).toBe("function");

            const signinResponse = factory.auth.signin({ userId: 1 });
            expect(signinResponse.path).toBe("auth.signin");
            expect(signinResponse.message).toBe("Signed in successfully");
            expect(signinResponse.data).toEqual({ userId: 1 });
        });

        it("should handle deeply nested messages", () => {
            const messages = {
                api: {
                    user: {
                        get: "Retrieved user",
                        update: "Updated user",
                    },
                },
            };

            const factory = createSuccessFactory(messages);

            const getResponse = factory.api.user.get({ id: 1 });
            expect(getResponse.path).toBe("api.user.get");
            expect(getResponse.message).toBe("Retrieved user");
            expect(getResponse.data).toEqual({ id: 1 });
        });
    });
});

describe("createCustomError", () => {
    describe("string message overload", () => {
        it("should create error response with string message", () => {
            const response = createCustomError("Custom error message");

            expect(response.success).toBe(false);
            expect(response.status).toBe(
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            );
            expect(response.path).toBe("custom");
            expect(response.message).toBe("Custom error message");
            expect(response.error).toBeUndefined();
            expect(response.data).toBeUndefined();
        });
    });

    describe("config object overload", () => {
        it("should create error response with config object", () => {
            const response = createCustomError({
                message: "Custom error",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            });

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(response.path).toBe("custom");
            expect(response.message).toBe("Custom error");
        });

        it("should create error response with error details", () => {
            const errorDetails = { code: "CUSTOM_ERR", reason: "Test" };
            const response = createCustomError({
                message: "Custom error",
                error: errorDetails,
            });

            expect(response.error).toEqual(errorDetails);
        });

        it("should create error response with data", () => {
            const data = { requestId: "req-123" };
            const response = createCustomError({
                message: "Custom error",
                data,
            });

            expect(response.data).toEqual(data);
        });

        it("should create error response with all config fields", () => {
            const errorDetails = { code: "ERR" };
            const data = { requestId: "req-123" };
            const response = createCustomError({
                message: "Custom error",
                status: HTTP_ERROR_STATUS.NOT_FOUND,
                error: errorDetails,
                data,
            });

            expect(response.status).toBe(HTTP_ERROR_STATUS.NOT_FOUND);
            expect(response.error).toEqual(errorDetails);
            expect(response.data).toEqual(data);
        });

        it("should default status to INTERNAL_SERVER_ERROR when not provided", () => {
            const response = createCustomError({
                message: "Custom error",
            });

            expect(response.status).toBe(
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            );
        });
    });

    describe("type tests", () => {
        it("should return ApiErrorResponse type", () => {
            const response = createCustomError("Error");
            expectTypeOf(response).toEqualTypeOf<ApiErrorResponse<unknown>>();
        });

        it("should preserve generic error type", () => {
            type CustomError = { code: string };
            const response = createCustomError<CustomError>({
                message: "Error",
                error: { code: "ERR" },
            });
            expectTypeOf(response).toEqualTypeOf<
                ApiErrorResponse<CustomError>
            >();
        });
    });
});

describe("createCustomSuccess", () => {
    describe("data-only overload", () => {
        it("should create success response with data only", () => {
            const response = createCustomSuccess({ id: 1, name: "Test" });

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.path).toBe("custom");
            expect(response.message).toBe("Success");
            expect(response.data).toEqual({ id: 1, name: "Test" });
        });

        it("should handle different data types", () => {
            const stringResponse = createCustomSuccess("string");
            expect(stringResponse.data).toBe("string");

            const numberResponse = createCustomSuccess(42);
            expect(numberResponse.data).toBe(42);

            const arrayResponse = createCustomSuccess([1, 2, 3]);
            expect(arrayResponse.data).toEqual([1, 2, 3]);
        });
    });

    describe("config object overload", () => {
        it("should create success response with config object", () => {
            const response = createCustomSuccess({
                message: "Custom success",
                data: { id: 1 },
            });

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.path).toBe("custom");
            expect(response.message).toBe("Custom success");
            expect(response.data).toEqual({ id: 1 });
        });

        it("should create success response with custom status", () => {
            const response = createCustomSuccess({
                message: "Created",
                data: { id: 1 },
                status: HTTP_SUCCESS_STATUS.CREATED,
            });

            expect(response.status).toBe(HTTP_SUCCESS_STATUS.CREATED);
        });

        it("should default status to OK when not provided", () => {
            const response = createCustomSuccess({
                message: "Success",
                data: { id: 1 },
            });

            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
        });
    });

    describe("type tests", () => {
        it("should return ApiSuccessResponse type", () => {
            const response = createCustomSuccess("data");
            expectTypeOf(response).toEqualTypeOf<
                ApiSuccessResponse<string | unknown>
            >();
        });

        it("should preserve generic data type", () => {
            type CustomData = { id: number; name: string };
            const response = createCustomSuccess<CustomData>({
                id: 1,
                name: "Test",
            });
            expectTypeOf(response.data).toEqualTypeOf<CustomData | unknown>();
        });
    });
});

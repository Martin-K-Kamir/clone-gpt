import { describe, expect, expectTypeOf, it } from "vitest";

import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from "@/lib/constants/http";

import { api } from "./index";
import type { ApiErrorResponse, ApiSuccessResponse } from "./responses";

describe("api", () => {
    describe("structure", () => {
        it("should have error and success properties", () => {
            expect(api).toHaveProperty("error");
            expect(api).toHaveProperty("success");
        });

        it("should have error as a function (createCustomError)", () => {
            expect(typeof api.error).toBe("function");
        });

        it("should have success as a function (createCustomSuccess)", () => {
            expect(typeof api.success).toBe("function");
        });
    });

    describe("api.success.chat.delete", () => {
        it("should create success response with data", () => {
            const chatId = "chat-123";
            const response = api.success.chat.delete(chatId, { count: 1 });

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.data).toBe(chatId);
            expect(response.path).toBe("chat.delete");
            expect(response.message).toContain("deleted successfully");
        });

        it("should handle plural with count 1", () => {
            const response = api.success.chat.delete("chat-123", { count: 1 });
            expect(response.message).toContain("Chat deleted successfully");
        });

        it("should handle plural with count > 1", () => {
            const response = api.success.chat.delete(["chat-1", "chat-2"], {
                count: 2,
            });
            expect(response.message).toContain("chats deleted successfully");
        });

        it("should handle multiple chats", () => {
            const chatIds = ["chat-1", "chat-2", "chat-3"];
            const response = api.success.chat.delete(chatIds, { count: 3 });
            expect(response.data).toEqual(chatIds);
            expect(response.message).toContain("chats deleted successfully");
        });
    });

    describe("api.success.user.updateName", () => {
        it("should create success response with user name", () => {
            const userName = "John Doe";
            const response = api.success.user.updateName(userName);

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.data).toBe(userName);
            expect(response.path).toBe("user.updateName");
            expect(response.message).toBe("User name updated successfully");
        });

        it("should handle different name values", () => {
            const name1 = api.success.user.updateName("Alice");
            expect(name1.data).toBe("Alice");

            const name2 = api.success.user.updateName("Bob");
            expect(name2.data).toBe("Bob");
        });

        it("should handle empty string", () => {
            const response = api.success.user.updateName("");
            expect(response.data).toBe("");
        });
    });

    describe("api.success.auth.signin", () => {
        it("should create success response with null data", () => {
            const response = api.success.auth.signin(null);

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.data).toBeNull();
            expect(response.path).toBe("auth.signin");
            expect(response.message).toBe("Signed in successfully!");
        });

        it("should create success response with user data", () => {
            const userData = { id: "user-123", email: "test@example.com" };
            const response = api.success.auth.signin(userData);

            expect(response.data).toEqual(userData);
            expect(response.message).toBe("Signed in successfully!");
        });
    });

    describe("api.error.chat.delete", () => {
        it("should create error response with error and count", () => {
            const error = {
                code: "DELETE_FAILED",
                message: "Failed to delete",
            };
            const response = api.error.chat.delete(error, { count: 1 });

            expect(response.success).toBe(false);
            expect(response.status).toBe(
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            );
            expect(response.error).toEqual(error);
            expect(response.path).toBe("chat.delete");
            expect(response.message).toContain("Failed to delete");
        });

        it("should handle plural with count 1", () => {
            const response = api.error.chat.delete(undefined, { count: 1 });
            expect(response.message).toContain("Failed to delete");
            expect(response.message).toContain("chat");
        });

        it("should handle plural with count > 1", () => {
            const response = api.error.chat.delete(undefined, { count: 5 });
            expect(response.message).toContain("Failed to delete");
            expect(response.message).toContain("chats");
        });
    });

    describe("api.error.custom and api.success.custom", () => {
        it("should support custom error with string message", () => {
            const response = api.error("Custom error message");

            expect(response.success).toBe(false);
            expect(response.status).toBe(
                HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            );
            expect(response.path).toBe("custom");
            expect(response.message).toBe("Custom error message");
        });

        it("should support custom error with config object", () => {
            const errorDetails = { code: "CUSTOM_ERR" };
            const response = api.error({
                message: "Custom error",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
                error: errorDetails,
            });

            expect(response.status).toBe(HTTP_ERROR_STATUS.BAD_REQUEST);
            expect(response.error).toEqual(errorDetails);
        });

        it("should support custom success with data", () => {
            const data = { id: 1, name: "Test" };
            const response = api.success(data);

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.data).toEqual(data);
            expect(response.path).toBe("custom");
            expect(response.message).toBe("Success");
        });

        it("should support custom success with config object", () => {
            const response = api.success({
                message: "Custom success",
                data: { id: 1 },
                status: HTTP_SUCCESS_STATUS.CREATED,
            });

            expect(response.status).toBe(HTTP_SUCCESS_STATUS.CREATED);
            expect(response.message).toBe("Custom success");
        });
    });

    describe("api.success.chat.get", () => {
        it("should handle plural with count", () => {
            const chats = [{ id: "chat-1" }, { id: "chat-2" }];
            const response = api.success.chat.get(chats, { count: 2 });

            expect(response.data).toEqual(chats);
            expect(response.message).toContain("Successfully retrieved");
            expect(response.message).toContain("chats");
        });

        it("should handle single chat", () => {
            const chat = { id: "chat-1" };
            const response = api.success.chat.get(chat, { count: 1 });

            expect(response.data).toEqual(chat);
            expect(response.message).toContain("Successfully retrieved");
            expect(response.message).toContain("chat");
        });
    });

    describe("api.success.chat.create", () => {
        it("should create success response with CREATED status", () => {
            const chatData = { id: "chat-123", title: "New Chat" };
            const response = api.success.chat.create(chatData);

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.CREATED);
            expect(response.data).toEqual(chatData);
            expect(response.path).toBe("chat.create");
            expect(response.message).toBe("Chat created successfully");
        });
    });

    describe("api.error.chat.notFound", () => {
        it("should create error response with NOT_FOUND status", () => {
            const response = api.error.chat.notFound();

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.NOT_FOUND);
            expect(response.path).toBe("chat.notFound");
            expect(response.message).toBe("Chat not found");
        });

        it("should accept error details", () => {
            const errorDetails = { chatId: "chat-123" };
            const response = api.error.chat.notFound(errorDetails);

            expect(response.error).toEqual(errorDetails);
        });
    });

    describe("api.error.user.notFound", () => {
        it("should create error response with NOT_FOUND status", () => {
            const response = api.error.user.notFound();

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.NOT_FOUND);
            expect(response.path).toBe("user.notFound");
            expect(response.message).toBe("User not found");
        });
    });

    describe("api.success.auth.signup", () => {
        it("should create success response", () => {
            const userData = { id: "user-123", email: "test@example.com" };
            const response = api.success.auth.signup(userData);

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.data).toEqual(userData);
            expect(response.message).toBe("Account created successfully!");
        });
    });

    describe("api.success.auth.signout", () => {
        it("should create success response", () => {
            const response = api.success.auth.signout(null);

            expect(response.success).toBe(true);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);
            expect(response.message).toBe("Signed out successfully!");
        });
    });

    describe("api.error.session.authentication", () => {
        it("should create error response with UNAUTHORIZED status", () => {
            const response = api.error.session.authentication();

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.UNAUTHORIZED);
            expect(response.path).toBe("session.authentication");
            expect(response.message).toBe("User not authenticated");
        });
    });

    describe("api.error.session.authorization", () => {
        it("should create error response with FORBIDDEN status", () => {
            const response = api.error.session.authorization();

            expect(response.success).toBe(false);
            expect(response.status).toBe(HTTP_ERROR_STATUS.FORBIDDEN);
            expect(response.path).toBe("session.authorization");
            expect(response.message).toBe(
                "User does not have permission to access this resource",
            );
        });
    });

    describe("api.success.file.upload", () => {
        it("should handle fileName placeholder", () => {
            const fileData = { id: "file-123" };
            const response = api.success.file.upload(fileData, {
                fileName: "document.pdf",
            });

            expect(response.data).toEqual(fileData);
            expect(response.message).toBe("Successfully uploaded document.pdf");
        });
    });

    describe("api.error.file.upload", () => {
        it("should handle fileName placeholder", () => {
            const error = { code: "UPLOAD_FAILED" };
            const response = api.error.file.upload(error, {
                fileName: "document.pdf",
            });

            expect(response.error).toEqual(error);
            expect(response.message).toBe("Failed to upload document.pdf");
        });
    });

    describe("api.success.file.uploadMany", () => {
        it("should handle plural with count", () => {
            const files = [
                { id: "file-1" },
                { id: "file-2" },
                { id: "file-3" },
            ];
            const response = api.success.file.uploadMany(files, { count: 3 });

            expect(response.data).toEqual(files);
            expect(response.message).toContain("Successfully uploaded");
            expect(response.message).toContain("files");
        });

        it("should handle single file", () => {
            const files = [{ id: "file-1" }];
            const response = api.success.file.uploadMany(files, { count: 1 });

            expect(response.message).toContain("Successfully uploaded");
            expect(response.message).toContain("file");
        });
    });

    describe("integration with toResponse", () => {
        it("should support chaining toResponse for success", async () => {
            const response = api.success.user
                .updateName("John Doe")
                .toResponse();

            expect(response).toBeInstanceOf(Response);
            expect(response.status).toBe(HTTP_SUCCESS_STATUS.OK);

            const body = await response.json();
            expect(body.success).toBe(true);
            expect(body.data).toBe("John Doe");
        });

        it("should support chaining toResponse for error", async () => {
            const response = api.error.chat.notFound().toResponse();

            expect(response).toBeInstanceOf(Response);
            expect(response.status).toBe(HTTP_ERROR_STATUS.NOT_FOUND);

            const body = await response.json();
            expect(body.success).toBe(false);
            expect(body.message).toBe("Chat not found");
        });
    });

    describe("type tests", () => {
        it("should return correct types for success responses", () => {
            const response = api.success.user.updateName("Test");
            expectTypeOf(response).toEqualTypeOf<ApiSuccessResponse<string>>();
        });

        it("should return correct types for error responses", () => {
            const response = api.error.chat.notFound();
            expectTypeOf(response).toEqualTypeOf<ApiErrorResponse<unknown>>();
        });

        it("should preserve generic types", () => {
            type CustomData = { id: string; name: string };
            const response = api.success.auth.signin<CustomData>({
                id: "1",
                name: "Test",
            });
            expectTypeOf(response.data).toEqualTypeOf<CustomData>();
        });
    });
});

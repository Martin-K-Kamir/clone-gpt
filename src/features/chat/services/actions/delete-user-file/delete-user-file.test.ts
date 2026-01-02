import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { deleteUserFile } from "./delete-user-file";

const constants = vi.hoisted(() => ({
    userId: "00000000-0000-0000-0000-000000000abc",
    chatId: "30000000-0000-0000-0000-000000000abc",
    fileId: "550e8400-e29b-41d4-a716-446655440000",
}));

const mocks = vi.hoisted(() => ({
    deleteUserFile: vi.fn(),
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: constants.userId, name: "Test User" },
    }),
}));

const apiSuccess = { ok: true };
const apiError = { ok: false };

vi.mock("@/lib/api-response", () => ({
    api: {
        success: {
            file: {
                delete: vi.fn(() => apiSuccess),
            },
        },
        error: {
            file: {
                delete: vi.fn(() => apiError),
            },
        },
    },
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteUserFile: mocks.deleteUserFile,
}));

describe("deleteUserFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: { id: constants.userId, name: "Test User" },
        });
    });

    it("returns success when delete works", async () => {
        const storedFile = {
            fileId: constants.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };
        mocks.deleteUserFile.mockResolvedValue({ fileId: constants.fileId });

        const result = await deleteUserFile({
            storedFile,
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiSuccess);
        expect(mocks.deleteUserFile).toHaveBeenCalledWith({
            storedFile,
            chatId: constants.chatId,
            userId: constants.userId,
        });
    });

    it("returns error when storage delete fails", async () => {
        const storedFile = {
            fileId: constants.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };
        mocks.deleteUserFile.mockRejectedValue(new Error("Storage error"));

        const result = await deleteUserFile({
            storedFile,
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when session is missing", async () => {
        (auth as any).mockResolvedValueOnce(null);

        const storedFile = {
            fileId: constants.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };

        const result = await deleteUserFile({
            storedFile,
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when storedFile is invalid", async () => {
        const result = await deleteUserFile({
            storedFile: "invalid" as any,
            chatId: constants.chatId as any,
        });

        expect(result).toEqual(apiError);
    });

    it("returns error when chatId is invalid", async () => {
        const storedFile = {
            fileId: constants.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };

        const result = await deleteUserFile({
            storedFile,
            chatId: "not-a-uuid" as any,
        });

        expect(result).toEqual(apiError);
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { deleteUserFile } from "./delete-user-file";

const mocks = vi.hoisted(() => ({
    deleteUserFile: vi.fn(),
    userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
    chatId: "30000000-0000-0000-0000-000000000001" as DBChatId,
    fileId: "550e8400-e29b-41d4-a716-446655440000",
}));

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn().mockResolvedValue({
        user: { id: mocks.userId, name: "Test User" },
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
        vi.mocked(auth).mockResolvedValue({
            user: { id: mocks.userId, name: "Test User" },
        } as any);
    });

    it("should delete file successfully", async () => {
        const storedFile = {
            fileId: mocks.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };
        mocks.deleteUserFile.mockResolvedValue({ fileId: mocks.fileId });

        const result = await deleteUserFile({
            storedFile,
            chatId: mocks.chatId,
        });

        expect(result).toEqual(apiSuccess);
    });

    it("should return error when deletion fails", async () => {
        const storedFile = {
            fileId: mocks.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };
        mocks.deleteUserFile.mockRejectedValue(new Error("Storage error"));

        const result = await deleteUserFile({
            storedFile,
            chatId: mocks.chatId,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when session is missing", async () => {
        vi.mocked(auth).mockResolvedValueOnce(null as any);

        const storedFile = {
            fileId: mocks.fileId,
            name: "test.jpg",
            fileUrl: "https://example.com/test.jpg",
            mediaType: "image/jpeg",
            extension: "jpg",
            size: 1024,
        };

        const result = await deleteUserFile({
            storedFile,
            chatId: mocks.chatId,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when storedFile is invalid", async () => {
        const result = await deleteUserFile({
            storedFile: "invalid" as any,
            chatId: mocks.chatId,
        });

        expect(result).toEqual(apiError);
    });

    it("should return error when chatId is invalid", async () => {
        const storedFile = {
            fileId: mocks.fileId,
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

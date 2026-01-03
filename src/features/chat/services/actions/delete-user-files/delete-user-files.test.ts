import { beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import type { DBChatId } from "@/features/chat/lib/types";

import { deleteUserFiles } from "./delete-user-files";

const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const userId = "00000000-0000-0000-0000-000000000001";

const mocks = vi.hoisted(() => ({
    deleteUserFile: vi.fn(),
}));

const apiSuccess = { success: true as const };
const apiError = { success: false as const };

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/chat/services/storage", () => ({
    deleteUserFile: mocks.deleteUserFile,
}));

vi.mock("@/lib/api-response", () => {
    const errorFn = vi.fn(_options => apiError);
    return {
        api: {
            success: {
                file: {
                    deleteMany: vi.fn((data, _placeholders) => ({
                        ...apiSuccess,
                        data,
                    })),
                },
            },
            error: Object.assign(errorFn, {
                file: {
                    deleteMany: vi.fn((_error, _placeholders) => apiError),
                },
            }),
        },
    };
});

describe("deleteUserFiles", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user",
            },
        });
    });

    it("deletes files and returns success response", async () => {
        const storedFiles = [
            {
                fileId: "550e8400-e29b-41d4-a716-446655440001",
                name: "file1.txt",
                fileUrl: "https://example.com/file1.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
            {
                fileId: "550e8400-e29b-41d4-a716-446655440002",
                name: "file2.pdf",
                fileUrl: "https://example.com/file2.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 200,
            },
        ];

        mocks.deleteUserFile
            .mockResolvedValueOnce({
                fileId: "550e8400-e29b-41d4-a716-446655440001",
            })
            .mockResolvedValueOnce({
                fileId: "550e8400-e29b-41d4-a716-446655440002",
            });

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(true);
        expect(mocks.deleteUserFile).toHaveBeenCalledTimes(2);
    });

    it("handles single file deletion", async () => {
        const storedFiles = [
            {
                fileId: "550e8400-e29b-41d4-a716-446655440001",
                name: "file1.txt",
                fileUrl: "https://example.com/file1.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mocks.deleteUserFile.mockResolvedValue({
            fileId: "550e8400-e29b-41d4-a716-446655440001",
        });

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(1);
        }
    });

    it("returns error when session does not exist", async () => {
        (auth as any).mockResolvedValue(null);

        const storedFiles = [
            {
                fileId: "550e8400-e29b-41d4-a716-446655440001",
                name: "file1.txt",
                fileUrl: "https://example.com/file1.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(false);
    });

    it("handles storage errors", async () => {
        const storedFiles = [
            {
                fileId: "550e8400-e29b-41d4-a716-446655440001",
                name: "file1.txt",
                fileUrl: "https://example.com/file1.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mocks.deleteUserFile.mockRejectedValue(new Error("Storage error"));

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(false);
    });

    it("handles partial failures gracefully", async () => {
        const storedFiles = [
            {
                fileId: "550e8400-e29b-41d4-a716-446655440001",
                name: "file1.txt",
                fileUrl: "https://example.com/file1.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
            {
                fileId: "550e8400-e29b-41d4-a716-446655440002",
                name: "file2.pdf",
                fileUrl: "https://example.com/file2.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 200,
            },
        ];

        mocks.deleteUserFile
            .mockResolvedValueOnce({
                fileId: "550e8400-e29b-41d4-a716-446655440001",
            })
            .mockRejectedValueOnce(new Error("Storage error"));

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(false);
    });
});

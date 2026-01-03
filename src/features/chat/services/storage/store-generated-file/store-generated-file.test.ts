import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { storeGeneratedFile } from "./store-generated-file";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

const mocks = vi.hoisted(() => ({
    uploadToStorage: vi.fn(),
}));

vi.mock("../upload-to-storage/upload-to-storage", () => ({
    uploadToStorage: mocks.uploadToStorage,
}));

describe("storeGeneratedFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("stores file and returns file URL", async () => {
        const generatedFile = Buffer.from([1, 2, 3, 4]);
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-files/test-file.pdf";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedFile({
            generatedFile,
            name: "test-file",
            extension: "pdf",
            chatId,
            userId,
            contentType: "application/pdf",
        });

        expect(result).toEqual({
            name: "test-file",
            fileId,
            fileUrl: publicUrl,
        });
    });

    it("handles different file types", async () => {
        const generatedFile = Buffer.from("test content", "utf8");
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-files/document.txt";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedFile({
            generatedFile,
            name: "document",
            extension: "txt",
            chatId,
            userId,
            contentType: "text/plain",
        });

        expect(result.fileUrl).toBe(publicUrl);
        expect(result.fileId).toBe(fileId);
        expect(result.name).toBe("document");
    });

    it("handles different content types", async () => {
        const generatedFile = Buffer.from("json data", "utf8");
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-files/data.json";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedFile({
            generatedFile,
            name: "data",
            extension: "json",
            chatId,
            userId,
            contentType: "application/json",
        });

        expect(result).toEqual({
            name: "data",
            fileId,
            fileUrl: publicUrl,
        });
    });

    it("uses GENERATED_FILES bucket", async () => {
        const generatedFile = Buffer.from([1, 2, 3]);
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-files/file.csv";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedFile({
            generatedFile,
            name: "file",
            extension: "csv",
            chatId,
            userId,
            contentType: "text/csv",
        });

        expect(result.fileUrl).toContain(STORAGE_BUCKET.GENERATED_FILES);
    });

    it("throws error when upload fails", async () => {
        const generatedFile = Buffer.from([1, 2, 3]);
        const uploadError = new Error("Upload failed");

        mocks.uploadToStorage.mockRejectedValue(uploadError);

        await expect(
            storeGeneratedFile({
                generatedFile,
                name: "test",
                extension: "txt",
                chatId,
                userId,
                contentType: "text/plain",
            }),
        ).rejects.toThrow("Upload failed");
    });
});

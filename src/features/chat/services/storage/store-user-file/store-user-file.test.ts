import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";

import { storeUserFile } from "./store-user-file";

const userId = generateUserId();
const chatId = generateChatId();

const mocks = vi.hoisted(() => ({
    uploadToStorage: vi.fn(),
}));

vi.mock("../upload-to-storage/upload-to-storage", () => ({
    uploadToStorage: mocks.uploadToStorage,
}));

describe("storeUserFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should store file and return file URL", async () => {
        const file = new File(["test content"], "test-file.txt", {
            type: "text/plain",
        });
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/user-files/test-file.txt";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeUserFile({
            file,
            chatId,
            userId,
        });

        expect(result).toEqual({
            name: "test-file.txt",
            fileId,
            fileUrl: publicUrl,
            mediaType: "text/plain",
        });
    });

    it("should handle different file types", async () => {
        const file = new File(["pdf content"], "document.pdf", {
            type: "application/pdf",
        });
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/user-files/document.pdf";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeUserFile({
            file,
            chatId,
            userId,
        });

        expect(result.fileUrl).toBe(publicUrl);
        expect(result.fileId).toBe(fileId);
        expect(result.name).toBe("document.pdf");
        expect(result.mediaType).toBe("application/pdf");
    });

    it("should use USER_FILES bucket", async () => {
        const file = new File(["content"], "file.csv", {
            type: "text/csv",
        });
        const fileId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/user-files/file.csv";

        mocks.uploadToStorage.mockResolvedValue({
            id: fileId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeUserFile({
            file,
            chatId,
            userId,
        });

        expect(result.fileUrl).toContain(STORAGE_BUCKET.USER_FILES);
    });

    it("should throw error when upload fails", async () => {
        const file = new File(["content"], "test.txt", {
            type: "text/plain",
        });
        const uploadError = new Error("Upload failed");

        mocks.uploadToStorage.mockRejectedValue(uploadError);

        await expect(
            storeUserFile({
                file,
                chatId,
                userId,
            }),
        ).rejects.toThrow("Upload failed");
    });
});

import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";

import { uploadToStorage } from "./upload-to-storage";

describe("uploadToStorage", () => {
    const userId = generateUserId();
    const chatId = generateChatId();

    beforeEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("should upload a file to storage and return public URL", async () => {
        const testContent = new Blob(["test file content"], {
            type: "text/plain",
        });
        const contentArrayBuffer = await testContent.arrayBuffer();

        const result = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "test-file",
            extension: "txt",
            content: contentArrayBuffer,
            contentType: "text/plain",
        });

        expect(result.publicUrl).toContain(STORAGE_BUCKET.USER_FILES);
        expect(result.path).toContain("test-file");
        expect(result.path).toMatch(/\.txt$/);
    });

    it("should upload different file types correctly", async () => {
        const imageContent = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]);

        const result = await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            userId,
            chatId,
            name: "test-image",
            extension: "png",
            content: imageContent,
            contentType: "image/png",
        });

        expect(result.publicUrl).toContain(STORAGE_BUCKET.GENERATED_IMAGES);
        expect(result.path).toMatch(/\.png$/);
    });

    it("should generate unique file paths for each upload", async () => {
        const content = new Blob(["content"], { type: "text/plain" });
        const contentArrayBuffer = await content.arrayBuffer();

        const result1 = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "same-name",
            extension: "txt",
            content: contentArrayBuffer,
            contentType: "text/plain",
        });

        const result2 = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "same-name",
            extension: "txt",
            content: contentArrayBuffer,
            contentType: "text/plain",
        });

        expect(result1.path).not.toBe(result2.path);
        expect(result1.id).not.toBe(result2.id);
    });

    it("should throw error when upload fails", async () => {
        const invalidBucket = "non-existent-bucket" as any;
        const content = new Blob(["content"], { type: "text/plain" });
        const contentArrayBuffer = await content.arrayBuffer();

        await expect(
            uploadToStorage({
                bucket: invalidBucket,
                userId,
                chatId,
                name: "test",
                extension: "txt",
                content: contentArrayBuffer,
                contentType: "text/plain",
            }),
        ).rejects.toThrow("Failed to upload file");
    });
});

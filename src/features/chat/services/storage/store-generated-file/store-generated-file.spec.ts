import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";

import { storeGeneratedFile } from "./store-generated-file";

describe("storeGeneratedFile", () => {
    const userId = generateUserId();
    const chatId = generateChatId();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("should store file and return file URL", async () => {
        const content = Buffer.from("test file content", "utf8");

        const result = await storeGeneratedFile({
            generatedFile: content,
            name: "test-file",
            extension: "txt",
            chatId,
            userId,
            contentType: "text/plain",
        });

        expect(result).toHaveProperty("name", "test-file");
        expect(result).toHaveProperty("fileId");
        expect(result.fileId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result).toHaveProperty("fileUrl");
        expect(result.fileUrl).toContain(STORAGE_BUCKET.GENERATED_FILES);
    });

    it("should handle different file types", async () => {
        const pdfContent = Buffer.from([0x25, 0x50, 0x44, 0x46]);

        const result = await storeGeneratedFile({
            generatedFile: pdfContent,
            name: "document",
            extension: "pdf",
            chatId,
            userId,
            contentType: "application/pdf",
        });

        expect(result.name).toBe("document");
        expect(result.fileUrl).toContain(STORAGE_BUCKET.GENERATED_FILES);
        expect(result.fileUrl).toMatch(/\.pdf$/);
    });

    it("should handle different content types", async () => {
        const content = Buffer.from([1, 2, 3, 4]);

        const result = await storeGeneratedFile({
            generatedFile: content,
            name: "data",
            extension: "json",
            chatId,
            userId,
            contentType: "application/json",
        });

        expect(result.name).toBe("data");
        expect(result.fileId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result.fileUrl).toContain(STORAGE_BUCKET.GENERATED_FILES);
    });
});

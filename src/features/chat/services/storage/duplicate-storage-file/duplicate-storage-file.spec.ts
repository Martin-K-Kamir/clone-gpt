import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateUniqueChatId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import { hashId } from "@/features/chat/services/storage/hash-id/hash-id";
import { uploadToStorage } from "@/features/chat/services/storage/upload-to-storage";

import { supabase } from "@/services/supabase";

import { duplicateStorageFile } from "./duplicate-storage-file";

describe("duplicateStorageFile", () => {
    const userId = generateUniqueUserId();
    const chatId = generateUniqueChatId();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("duplicates file to new location", async () => {
        const content = new Blob(["original content"], { type: "text/plain" });

        const uploadResult = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "original-file",
            extension: "txt",
            content: await content.arrayBuffer(),
            contentType: "text/plain",
        });

        const result = await duplicateStorageFile({
            url: uploadResult.publicUrl,
            name: "duplicated-file",
            chatId,
            userId,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        expect(result.name).toBe("duplicated-file");
        expect(result.fileId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result.fileUrl).toContain(STORAGE_BUCKET.USER_FILES);
        expect(result.fileUrl).not.toBe(uploadResult.publicUrl);

        const hashedUserId = hashId(userId);
        const hashedChatId = hashId(chatId);

        const { data: files } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list(`${hashedUserId}/${hashedChatId}`, { limit: 1000 });

        expect(files?.length).toBeGreaterThanOrEqual(2);

        const fileNames = files?.map(f => f.name).join(",") || "";
        expect(fileNames).toContain("original-file");
        expect(fileNames).toContain("duplicated-file");
    });

    it("works with different buckets", async () => {
        const content = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]);

        const uploadResult = await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            userId,
            chatId,
            name: "original-image",
            extension: "png",
            content,
            contentType: "image/png",
        });

        const result = await duplicateStorageFile({
            url: uploadResult.publicUrl,
            name: "duplicated-image",
            chatId,
            userId,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });

        expect(result.fileUrl).toContain(STORAGE_BUCKET.GENERATED_IMAGES);
        expect(result.fileId).not.toBe(uploadResult.id);
    });

    it("throws error when URL is invalid", async () => {
        await expect(
            duplicateStorageFile({
                url: "https://invalid-domain.com/file.txt",
                name: "file",
                chatId,
                userId,
                bucket: STORAGE_BUCKET.USER_FILES,
            }),
        ).rejects.toThrow("Invalid storage URL");
    });

    it("throws error when file does not exist", async () => {
        const fakeUrl = `${process.env.SUPABASE_STORAGE_URL}/user-files/non-existent/file.txt`;

        await expect(
            duplicateStorageFile({
                url: fakeUrl,
                name: "file",
                chatId,
                userId,
                bucket: STORAGE_BUCKET.USER_FILES,
            }),
        ).rejects.toThrow("Failed to duplicate file");
    });
});

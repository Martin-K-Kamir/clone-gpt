import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateUniqueChatId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import { uploadToStorage } from "@/features/chat/services/storage/upload-to-storage";

import { supabase } from "@/services/supabase";

import { deleteUserFile } from "./delete-user-file";

describe("deleteUserFile", () => {
    const userId = generateUniqueUserId();
    const chatId = generateUniqueChatId();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("deletes file from storage", async () => {
        const content = new Blob(["test content"], { type: "text/plain" });

        const uploadResult = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "test-file",
            extension: "txt",
            content: await content.arrayBuffer(),
            contentType: "text/plain",
        });

        const storedFile = {
            fileId: uploadResult.id,
            name: "test-file.txt",
            fileUrl: uploadResult.publicUrl,
            mediaType: "text/plain",
            extension: "txt",
            size: content.size,
        };

        const result = await deleteUserFile({
            storedFile,
            userId,
            chatId,
        });

        expect(result).toEqual({ fileId: uploadResult.id });

        const { data: files } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list("", { limit: 1000 });

        const fileExists = files?.some(file => file.name.includes("test-file"));

        expect(fileExists).toBe(false);
    });

    it("handles non-existent file gracefully", async () => {
        const storedFile = {
            fileId: "00000000-0000-0000-0000-000000000000",
            name: "non-existent.txt",
            fileUrl: "https://example.com/non-existent.txt",
            mediaType: "text/plain",
            extension: "txt",
            size: 0,
        };

        const result = await deleteUserFile({
            storedFile,
            userId,
            chatId,
        });

        expect(result).toEqual({ fileId: storedFile.fileId });
    });
});

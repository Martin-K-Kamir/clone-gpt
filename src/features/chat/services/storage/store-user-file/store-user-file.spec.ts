import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";

import { storeUserFile } from "./store-user-file";

describe("storeUserFile", () => {
    const userId = generateUserId();
    const chatId = generateChatId();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("should store file and return file URL", async () => {
        const file = new File(["test file content"], "test-file.txt", {
            type: "text/plain",
        });

        const result = await storeUserFile({
            file,
            chatId,
            userId,
        });

        expect(result).toHaveProperty("name", "test-file.txt");
        expect(result).toHaveProperty("fileId");
        expect(result.fileId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result).toHaveProperty("fileUrl");
        expect(result.fileUrl).toContain(STORAGE_BUCKET.USER_FILES);
        expect(result.mediaType).toBe("text/plain");
    });

    it("should handle different file types", async () => {
        const file = new File(["pdf content"], "document.pdf", {
            type: "application/pdf",
        });

        const result = await storeUserFile({
            file,
            chatId,
            userId,
        });

        expect(result.name).toBe("document.pdf");
        expect(result.fileUrl).toContain(STORAGE_BUCKET.USER_FILES);
        expect(result.fileUrl).toMatch(/\.pdf$/);
        expect(result.mediaType).toBe("application/pdf");
    });
});

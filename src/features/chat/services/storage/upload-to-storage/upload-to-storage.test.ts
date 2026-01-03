import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { uploadToStorage } from "./upload-to-storage";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

const mocks = vi.hoisted(() => ({
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    from: vi.fn(() => ({
        upload: mocks.upload,
        getPublicUrl: mocks.getPublicUrl,
    })),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        storage: {
            from: mocks.from,
        },
    },
}));

describe("uploadToStorage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.from.mockReturnValue({
            upload: mocks.upload,
            getPublicUrl: mocks.getPublicUrl,
        });
    });

    it("uploads file and returns public URL", async () => {
        const testContent = new Uint8Array([1, 2, 3, 4]);
        const testPublicUrl =
            "https://example.com/storage/v1/object/public/user-files/test-path.txt";

        mocks.upload.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: testPublicUrl },
        });

        const result = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "test-file",
            extension: "txt",
            content: testContent,
            contentType: "text/plain",
        });

        expect(result.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result.publicUrl).toBe(testPublicUrl);
        expect(result.path).toContain("test-file");
        expect(result.path).toMatch(/\.txt$/);
    });

    it("throws error when upload fails", async () => {
        const testContent = new Uint8Array([1, 2, 3]);
        const uploadError = { message: "Bucket not found" };

        mocks.upload.mockResolvedValue({ error: uploadError });

        await expect(
            uploadToStorage({
                bucket: STORAGE_BUCKET.USER_FILES,
                userId,
                chatId,
                name: "test",
                extension: "txt",
                content: testContent,
                contentType: "text/plain",
            }),
        ).rejects.toThrow("Failed to upload file: Bucket not found");
    });

    it("handles different content types correctly", async () => {
        const imageContent = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
        const testPath = "hashedUserId/hashedChatId/test-image-uuid.png";
        const testPublicUrl = `https://example.com/storage/v1/object/public/generated-images/${testPath}`;

        mocks.upload.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: testPublicUrl },
        });

        const result = await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            userId,
            chatId,
            name: "test-image",
            extension: "png",
            content: imageContent,
            contentType: "image/png",
        });

        expect(result.publicUrl).toBe(testPublicUrl);
    });

    it("generates unique file paths with UUID", async () => {
        const content = new Uint8Array([1, 2, 3]);

        mocks.upload.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: "https://example.com/file" },
        });

        const result1 = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "same-name",
            extension: "txt",
            content,
            contentType: "text/plain",
        });

        const result2 = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "same-name",
            extension: "txt",
            content,
            contentType: "text/plain",
        });

        expect(result1.id).not.toBe(result2.id);
        expect(result1.path).not.toBe(result2.path);
        expect(result1.path).toContain("same-name");
        expect(result2.path).toContain("same-name");
    });

    it("handles Blob content", async () => {
        const blobContent = new Blob(["test"], { type: "text/plain" });

        mocks.upload.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: "https://example.com/file" },
        });

        const result = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "test",
            extension: "txt",
            content: blobContent,
            contentType: "text/plain",
        });

        expect(result.publicUrl).toBe("https://example.com/file");
    });

    it("handles File content", async () => {
        const fileContent = new File(["test"], "test.txt", {
            type: "text/plain",
        });

        mocks.upload.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: "https://example.com/file" },
        });

        const result = await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "test",
            extension: "txt",
            content: fileContent,
            contentType: "text/plain",
        });

        expect(result.publicUrl).toBe("https://example.com/file");
    });
});

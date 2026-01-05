import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { duplicateStorageFile } from "./duplicate-storage-file";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

const mocks = vi.hoisted(() => ({
    copy: vi.fn(),
    getPublicUrl: vi.fn(),
    from: vi.fn(() => ({
        copy: mocks.copy,
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

describe("duplicateStorageFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.from.mockReturnValue({
            copy: mocks.copy,
            getPublicUrl: mocks.getPublicUrl,
        });
    });

    it("should duplicate file and return new file URL", async () => {
        const storageUrl = process.env.SUPABASE_STORAGE_URL;
        const sourceUrl = `${storageUrl}/user-files/path/to/file.txt`;
        const newPublicUrl = `${storageUrl}/user-files/new-path/to/file.txt`;

        mocks.copy.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: newPublicUrl },
        });

        const result = await duplicateStorageFile({
            url: sourceUrl,
            name: "file",
            chatId,
            userId,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        expect(result).toHaveProperty("name", "file");
        expect(result).toHaveProperty("fileId");
        expect(result.fileId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result).toHaveProperty("fileUrl", newPublicUrl);
    });

    it("should throw error when URL does not start with storage URL", async () => {
        const invalidUrl = "https://other-domain.com/file.txt";

        await expect(
            duplicateStorageFile({
                url: invalidUrl,
                name: "file",
                chatId,
                userId,
                bucket: STORAGE_BUCKET.USER_FILES,
            }),
        ).rejects.toThrow("Invalid storage URL");
    });

    it("should throw error when URL does not contain bucket path", async () => {
        const storageUrl = process.env.SUPABASE_STORAGE_URL;
        const invalidUrl = `${storageUrl}/`;

        await expect(
            duplicateStorageFile({
                url: invalidUrl,
                name: "file",
                chatId,
                userId,
                bucket: STORAGE_BUCKET.USER_FILES,
            }),
        ).rejects.toThrow("Failed to extract source path from URL");
    });

    it("should throw error when copy fails", async () => {
        const storageUrl = process.env.SUPABASE_STORAGE_URL;
        const sourceUrl = `${storageUrl}/user-files/path/to/file.txt`;

        mocks.copy.mockResolvedValue({
            error: { message: "Source file not found" },
        });

        await expect(
            duplicateStorageFile({
                url: sourceUrl,
                name: "file",
                chatId,
                userId,
                bucket: STORAGE_BUCKET.USER_FILES,
            }),
        ).rejects.toThrow("Failed to duplicate file: Source file not found");
    });

    it("should handle different buckets", async () => {
        const storageUrl = process.env.SUPABASE_STORAGE_URL;
        const sourceUrl = `${storageUrl}/generated-images/path/to/image.png`;
        const newPublicUrl = `${storageUrl}/generated-images/new-path/image.png`;

        mocks.copy.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: newPublicUrl },
        });

        const result = await duplicateStorageFile({
            url: sourceUrl,
            name: "image",
            chatId,
            userId,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });

        expect(result.fileUrl).toBe(newPublicUrl);
    });

    it("should handle URL-encoded paths", async () => {
        const storageUrl = process.env.SUPABASE_STORAGE_URL;
        const encodedPath = encodeURIComponent("path with spaces/file.txt");
        const sourceUrl = `${storageUrl}/user-files/${encodedPath}`;
        const newPublicUrl = `${storageUrl}/user-files/new-path/file.txt`;

        mocks.copy.mockResolvedValue({ error: null });
        mocks.getPublicUrl.mockReturnValue({
            data: { publicUrl: newPublicUrl },
        });

        const result = await duplicateStorageFile({
            url: sourceUrl,
            name: "file",
            chatId,
            userId,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        expect(result.fileUrl).toBe(newPublicUrl);
    });
});

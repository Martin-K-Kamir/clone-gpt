import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { storeGeneratedImage } from "./store-generated-image";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

const mocks = vi.hoisted(() => ({
    uploadToStorage: vi.fn(),
}));

vi.mock("../upload-to-storage/upload-to-storage", () => ({
    uploadToStorage: mocks.uploadToStorage,
}));

describe("storeGeneratedImage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should store image and return image URL", async () => {
        const generatedImage = {
            uint8Array: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
            mediaType: "image/png",
        } as any;
        const imageId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-images/test-image.png";

        mocks.uploadToStorage.mockResolvedValue({
            id: imageId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedImage({
            generatedImage,
            name: "test-image",
            chatId,
            userId,
        });

        expect(result).toEqual({
            name: "test-image",
            imageId,
            imageUrl: publicUrl,
        });
    });

    it("should handle different image types", async () => {
        const generatedImage = {
            uint8Array: new Uint8Array([0xff, 0xd8, 0xff]),
            mediaType: "image/jpeg",
        } as any;
        const imageId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-images/photo.jpg";

        mocks.uploadToStorage.mockResolvedValue({
            id: imageId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedImage({
            generatedImage,
            name: "photo",
            chatId,
            userId,
        });

        expect(result.imageUrl).toBe(publicUrl);
        expect(result.imageId).toBe(imageId);
        expect(result.name).toBe("photo");
    });

    it("should use GENERATED_IMAGES bucket", async () => {
        const generatedImage = {
            uint8Array: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
            mediaType: "image/png",
        } as any;
        const imageId = "550e8400-e29b-41d4-a716-446655440000";
        const publicUrl =
            "https://example.com/storage/v1/object/public/generated-images/image.png";

        mocks.uploadToStorage.mockResolvedValue({
            id: imageId,
            publicUrl,
            path: "test-path",
        });

        const result = await storeGeneratedImage({
            generatedImage,
            name: "image",
            chatId,
            userId,
        });

        expect(result.imageUrl).toContain(STORAGE_BUCKET.GENERATED_IMAGES);
    });

    it("should throw error when upload fails", async () => {
        const generatedImage = {
            uint8Array: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
            mediaType: "image/png",
        } as any;
        const uploadError = new Error("Upload failed");

        mocks.uploadToStorage.mockRejectedValue(uploadError);

        await expect(
            storeGeneratedImage({
                generatedImage,
                name: "test",
                chatId,
                userId,
            }),
        ).rejects.toThrow("Upload failed");
    });
});

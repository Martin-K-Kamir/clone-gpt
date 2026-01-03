import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateUniqueChatId,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, describe, expect, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";

import { storeGeneratedImage } from "./store-generated-image";

describe("storeGeneratedImage", () => {
    const userId = generateUniqueUserId();
    const chatId = generateUniqueChatId();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("stores image and returns image URL", async () => {
        const content = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]);
        const generatedImage = {
            uint8Array: content,
            mediaType: "image/png",
        } as any;

        const result = await storeGeneratedImage({
            generatedImage,
            name: "test-image",
            chatId,
            userId,
        });

        expect(result).toHaveProperty("name", "test-image");
        expect(result).toHaveProperty("imageId");
        expect(result.imageId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(result).toHaveProperty("imageUrl");
        expect(result.imageUrl).toContain(STORAGE_BUCKET.GENERATED_IMAGES);
    });

    it("handles different image types", async () => {
        const content = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
        const generatedImage = {
            uint8Array: content,
            mediaType: "image/jpeg",
        } as any;

        const result = await storeGeneratedImage({
            generatedImage,
            name: "photo",
            chatId,
            userId,
        });

        expect(result.name).toBe("photo");
        expect(result.imageUrl).toContain(STORAGE_BUCKET.GENERATED_IMAGES);
    });
});

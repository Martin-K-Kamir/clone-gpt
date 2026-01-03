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

import { deleteStorageDirectory } from "./delete-storage-directory";

describe("deleteStorageDirectory", () => {
    const userId = generateUniqueUserId();
    const chatId1 = generateUniqueChatId();
    const chatId2 = generateUniqueChatId();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("deletes all files for a specific chat", async () => {
        const content1 = new Blob(["file1"], { type: "text/plain" });
        const content2 = new Blob(["file2"], { type: "text/plain" });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId1,
            name: "file1",
            extension: "txt",
            content: await content1.arrayBuffer(),
            contentType: "text/plain",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId1,
            name: "file2",
            extension: "txt",
            content: await content2.arrayBuffer(),
            contentType: "text/plain",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId2,
            name: "file3",
            extension: "txt",
            content: await content2.arrayBuffer(),
            contentType: "text/plain",
        });

        await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId1,
        });

        const hashedUserId = hashId(userId);
        const hashedChatId1 = hashId(chatId1);
        const hashedChatId2 = hashId(chatId2);

        const { data: chat1Files } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list(`${hashedUserId}/${hashedChatId1}`);

        const { data: chat2Files } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list(`${hashedUserId}/${hashedChatId2}`);

        expect(chat1Files || []).toHaveLength(0);
        expect(chat2Files || []).toHaveLength(1);
    });

    it("deletes all files for a user when chatId is not provided", async () => {
        const content = new Blob(["content"], { type: "text/plain" });
        const buffer = await content.arrayBuffer();

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId1,
            name: "file1",
            extension: "txt",
            content: buffer,
            contentType: "text/plain",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId2,
            name: "file2",
            extension: "txt",
            content: buffer,
            contentType: "text/plain",
        });

        await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
        });

        const hashedUserId = hashId(userId);

        const { data: userFiles } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list(hashedUserId);

        expect(userFiles || []).toHaveLength(0);
    });

    it("handles empty directories gracefully", async () => {
        await expect(
            deleteStorageDirectory({
                bucket: STORAGE_BUCKET.USER_FILES,
                userId,
                chatId: generateUniqueChatId(),
            }),
        ).resolves.not.toThrow();
    });
});

import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateChatId,
    generateMessageId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import { hashId } from "@/features/chat/services/storage/hash-id/hash-id";
import { uploadToStorage } from "@/features/chat/services/storage/upload-to-storage";

import { supabase } from "@/services/supabase";

import { deleteAllUserChats } from "./delete-all-user-chats";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("deleteAllUserChats", () => {
    const userId = generateUserId();
    const email = generateUserEmail();

    beforeEach(async () => {
        vi.clearAllMocks();
        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Test User",
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").upsert(
            {
                id: userId,
                email,
                name: "Test User",
                role: "user",
            },
            { onConflict: "id" },
        );
    });

    afterEach(async () => {
        await cleanupStorageForUser(userId);
        await supabase.from("users").delete().eq("id", userId);
    });

    it("deletes all user chats, messages, and storage files", async () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();

        await supabase.from("chats").insert([
            {
                id: chatId1,
                userId,
                title: "Test Chat 1",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: chatId2,
                userId,
                title: "Test Chat 2",
                visibility: "private",
                visibleAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]);

        await supabase.from("messages").insert([
            {
                id: messageId1,
                chatId: chatId1,
                userId,
                role: "user",
                content: "Message 1",
                metadata: {},
                parts: [],
                createdAt: new Date().toISOString(),
            },
            {
                id: messageId2,
                chatId: chatId2,
                userId,
                role: "user",
                content: "Message 2",
                metadata: {},
                parts: [],
                createdAt: new Date().toISOString(),
            },
        ]);

        const fileContent = new Blob(["test file"], { type: "text/plain" });
        const imageContent = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]);
        const generatedContent = Buffer.from("generated content", "utf8");

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId: chatId1,
            name: "user-file",
            extension: "txt",
            content: await fileContent.arrayBuffer(),
            contentType: "text/plain",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            userId,
            chatId: chatId1,
            name: "generated-image",
            extension: "png",
            content: imageContent,
            contentType: "image/png",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_FILES,
            userId,
            chatId: chatId2,
            name: "generated-file",
            extension: "txt",
            content: generatedContent,
            contentType: "text/plain",
        });

        const result = await deleteAllUserChats();

        expect(result.success).toBe(true);

        const { data: chatsAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("userId", userId);

        expect(chatsAfter || []).toHaveLength(0);

        const { data: messagesAfter } = await supabase
            .from("messages")
            .select("id")
            .eq("userId", userId);

        expect(messagesAfter || []).toHaveLength(0);

        const hashedUserId = hashId(userId);

        const { data: userFiles } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list(hashedUserId);

        const { data: generatedImages } = await supabase.storage
            .from(STORAGE_BUCKET.GENERATED_IMAGES)
            .list(hashedUserId);

        const { data: generatedFiles } = await supabase.storage
            .from(STORAGE_BUCKET.GENERATED_FILES)
            .list(hashedUserId);

        expect(userFiles || []).toHaveLength(0);
        expect(generatedImages || []).toHaveLength(0);
        expect(generatedFiles || []).toHaveLength(0);
    });
});

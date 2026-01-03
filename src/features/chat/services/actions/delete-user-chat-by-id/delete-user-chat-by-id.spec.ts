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

import type { DBUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

import { deleteUserChatById } from "./delete-user-chat-by-id";

const userId = generateUserId();
const otherUserId = generateUserId();

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}));

describe("deleteUserChatById", () => {
    const email = generateUserEmail();
    const otherEmail = generateUserEmail();

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
            [
                {
                    id: userId,
                    email,
                    name: "Test User",
                    role: "user",
                },
                {
                    id: otherUserId,
                    email: otherEmail,
                    name: "Other User",
                    role: "user",
                },
            ],
            { onConflict: "id" },
        );
    });

    afterEach(async () => {
        await cleanupStorageForUser(userId);
        await cleanupStorageForUser(otherUserId);
        await supabase.from("users").delete().eq("id", userId);
        await supabase.from("users").delete().eq("id", otherUserId);
    });

    it("deletes chat, messages, and storage files", async () => {
        const chatId = generateChatId();
        const messageId = generateMessageId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await supabase.from("messages").insert({
            id: messageId,
            chatId,
            userId,
            role: "user",
            content: "Test message",
            metadata: {},
            parts: [],
            createdAt: new Date().toISOString(),
        });

        const fileContent = new Blob(["test file"], { type: "text/plain" });
        const imageContent = new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        ]);
        const generatedContent = Buffer.from("generated content", "utf8");

        await uploadToStorage({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
            name: "user-file",
            extension: "txt",
            content: await fileContent.arrayBuffer(),
            contentType: "text/plain",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            userId,
            chatId,
            name: "generated-image",
            extension: "png",
            content: imageContent,
            contentType: "image/png",
        });

        await uploadToStorage({
            bucket: STORAGE_BUCKET.GENERATED_FILES,
            userId,
            chatId,
            name: "generated-file",
            extension: "txt",
            content: generatedContent,
            contentType: "text/plain",
        });

        const result = await deleteUserChatById({ chatId });

        expect(result.success).toBe(true);

        const { data: chatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .maybeSingle();

        const { data: messagesAfter } = await supabase
            .from("messages")
            .select("id")
            .eq("chatId", chatId);

        expect(chatAfter).toBeNull();
        expect(messagesAfter || []).toHaveLength(0);

        const hashedUserId = hashId(userId);
        const hashedChatId = hashId(chatId);

        const { data: userFiles } = await supabase.storage
            .from(STORAGE_BUCKET.USER_FILES)
            .list(`${hashedUserId}/${hashedChatId}`);

        const { data: generatedImages } = await supabase.storage
            .from(STORAGE_BUCKET.GENERATED_IMAGES)
            .list(`${hashedUserId}/${hashedChatId}`);

        const { data: generatedFiles } = await supabase.storage
            .from(STORAGE_BUCKET.GENERATED_FILES)
            .list(`${hashedUserId}/${hashedChatId}`);

        expect(userFiles || []).toHaveLength(0);
        expect(generatedImages || []).toHaveLength(0);
        expect(generatedFiles || []).toHaveLength(0);
    });

    it("returns authorization error when user is not owner", async () => {
        const chatId = generateChatId();

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat to Delete",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        (auth as any).mockResolvedValue({
            user: {
                id: otherUserId,
                email: otherEmail,
                name: "Other User",
                image: null,
                role: "user",
            },
        });

        const result = await deleteUserChatById({ chatId });

        expect(result.success).toBe(false);

        const { data: chatAfter } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .maybeSingle();

        expect(chatAfter).not.toBeNull();
    });
});

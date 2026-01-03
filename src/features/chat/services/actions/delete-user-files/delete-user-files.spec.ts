import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateUniqueChatId,
    generateUniqueEmail,
    generateUniqueUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { storeUserFile } from "@/features/chat/services/storage/store-user-file/store-user-file";

import { supabase } from "@/services/supabase";

import { deleteUserFiles } from "./delete-user-files";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

describe("deleteUserFiles", () => {
    const userId = generateUniqueUserId();
    const email = generateUniqueEmail();

    beforeEach(async () => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("deletes files and returns success response", async () => {
        const chatId = generateUniqueChatId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Test User",
                image: null,
                role: "user",
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: "user",
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: "private",
            visibleAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const file1 = new File(["content1"], "file1.pdf", {
            type: "application/pdf",
        });
        const file2 = new File(["content2"], "file2.pdf", {
            type: "application/pdf",
        });

        const uploadResult1 = await storeUserFile({
            file: file1,
            userId,
            chatId,
        });

        const uploadResult2 = await storeUserFile({
            file: file2,
            userId,
            chatId,
        });

        const storedFiles = [
            {
                fileId: uploadResult1.fileId,
                name: uploadResult1.name,
                fileUrl: uploadResult1.fileUrl,
                mediaType: uploadResult1.mediaType,
                extension: "pdf",
                size: file1.size,
            },
            {
                fileId: uploadResult2.fileId,
                name: uploadResult2.name,
                fileUrl: uploadResult2.fileUrl,
                mediaType: uploadResult2.mediaType,
                extension: "pdf",
                size: file2.size,
            },
        ];

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(true);
    });

    it("returns error when session does not exist", async () => {
        const chatId = generateUniqueChatId();
        (auth as any).mockResolvedValue(null);

        const storedFiles = [
            {
                fileId: "00000000-0000-0000-0000-000000000000",
                name: "file.pdf",
                fileUrl: "https://example.com/file.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 100,
            },
        ];

        const result = await deleteUserFiles({
            storedFiles,
            chatId,
        });

        expect(result.success).toBe(false);
    });
});

import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { storeUserFile } from "@/features/chat/services/storage/store-user-file/store-user-file";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";

import { supabase } from "@/services/supabase";

import { deleteUserFiles } from "./delete-user-files";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

describe("deleteUserFiles", () => {
    const userId = generateUserId();
    const email = generateUserEmail();

    beforeEach(async () => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("should delete files and return success response", async () => {
        const chatId = generateChatId();

        (auth as any).mockResolvedValue({
            user: {
                id: userId,
                email,
                name: "Test User",
                image: null,
                role: USER_ROLE.USER,
            },
        });

        await supabase.from("users").insert({
            id: userId,
            email,
            name: "Test User",
            role: USER_ROLE.USER,
        });

        await supabase.from("chats").insert({
            id: chatId,
            userId,
            title: "Test Chat",
            visibility: CHAT_VISIBILITY.PRIVATE,
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

    it("should return error when session does not exist", async () => {
        const chatId = generateChatId();
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

import { cleanupStorageForUser } from "@/vitest/helpers/cleanup-storage";
import {
    generateChatId,
    generateUserEmail,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { auth } from "@/features/auth/services/auth";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";

import { supabase } from "@/services/supabase";

import { uploadUserFiles } from "./upload-user-files";

vi.mock("@/features/auth/services/auth", () => ({
    auth: vi.fn(),
}));

describe("uploadUserFiles", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    const userId = generateUserId();
    const email = generateUserEmail();

    afterEach(async () => {
        await cleanupStorageForUser(userId);
    });

    it("uploads files and returns processed files", async () => {
        const chatId = generateChatId();

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

        const result = await uploadUserFiles({
            files: [file1, file2],
            chatId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toHaveProperty("fileId");
            expect(result.data[0]).toHaveProperty("fileUrl");
            expect(result.data[0]).toHaveProperty("name", "file1.pdf");
            expect(result.data[0]).toHaveProperty(
                "mediaType",
                "application/pdf",
            );
            expect(result.data[0]).toHaveProperty("extension", "pdf");
            expect(result.data[0]).toHaveProperty("size");
            expect(result.data[0]).toHaveProperty(
                "kind",
                CHAT_MESSAGE_TYPE.FILE,
            );

            expect(result.data[1]).toHaveProperty("fileId");
            expect(result.data[1]).toHaveProperty("fileUrl");
            expect(result.data[1]).toHaveProperty("name", "file2.pdf");
            expect(result.data[1]).toHaveProperty(
                "mediaType",
                "application/pdf",
            );
            expect(result.data[1]).toHaveProperty("extension", "pdf");
            expect(result.data[1]).toHaveProperty(
                "kind",
                CHAT_MESSAGE_TYPE.FILE,
            );
        }
    });

    it("handles image files with dimensions", async () => {
        const chatId = generateChatId();

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

        const imageContent = new Uint8Array([
            0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
        ]);
        const imageFile = new File([imageContent], "image.jpg", {
            type: "image/jpeg",
        });

        const result = await uploadUserFiles({
            files: [imageFile],
            chatId,
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0]).toHaveProperty("fileId");
            expect(result.data[0]).toHaveProperty("fileUrl");
            expect(result.data[0]).toHaveProperty("name", "image.jpg");
            expect(result.data[0]).toHaveProperty("mediaType", "image/jpeg");
            expect(result.data[0]).toHaveProperty(
                "kind",
                CHAT_MESSAGE_TYPE.IMAGE,
            );
            expect(result.data[0]).toHaveProperty("width");
            expect(result.data[0]).toHaveProperty("height");
        }
    });

    it("returns error when session does not exist", async () => {
        const chatId = generateChatId();
        (auth as any).mockResolvedValue(null);

        const file = new File(["content"], "file.txt", {
            type: "text/plain",
        });

        const result = await uploadUserFiles({
            files: [file],
            chatId,
        });

        expect(result.success).toBe(false);
    });
});

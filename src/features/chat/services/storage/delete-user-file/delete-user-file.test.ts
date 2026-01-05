import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import type { DBChatId } from "@/features/chat/lib/types";

import type { DBUserId } from "@/features/user/lib/types";

import { deleteUserFile } from "./delete-user-file";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;
const fileId = "550e8400-e29b-41d4-a716-446655440000";

const mocks = vi.hoisted(() => ({
    remove: vi.fn(),
    from: vi.fn(() => ({
        remove: mocks.remove,
    })),
}));

vi.mock("@/services/supabase", () => ({
    supabase: {
        storage: {
            from: mocks.from,
        },
    },
}));

describe("deleteUserFile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.from.mockReturnValue({
            remove: mocks.remove,
        });
    });

    it("should delete file and return fileId", async () => {
        const storedFile = {
            fileId,
            name: "test-file.txt",
            fileUrl: "https://example.com/file.txt",
            mediaType: "text/plain",
            extension: "txt",
            size: 1024,
        };

        mocks.remove.mockResolvedValue({ error: null });

        const result = await deleteUserFile({
            storedFile,
            userId,
            chatId,
        });

        expect(result).toEqual({ fileId });
    });

    it("should throw error when delete fails", async () => {
        const storedFile = {
            fileId,
            name: "test-file.txt",
            fileUrl: "https://example.com/file.txt",
            mediaType: "text/plain",
            extension: "txt",
            size: 1024,
        };

        mocks.remove.mockResolvedValue({
            error: { message: "File not found" },
        });

        await expect(
            deleteUserFile({
                storedFile,
                userId,
                chatId,
            }),
        ).rejects.toThrow("Failed to delete file from storage: File not found");
    });

    it("should handle files with different extensions", async () => {
        const storedFile = {
            fileId,
            name: "image.png",
            fileUrl: "https://example.com/image.png",
            mediaType: "image/png",
            extension: "png",
            size: 2048,
        };

        mocks.remove.mockResolvedValue({ error: null });

        const result = await deleteUserFile({
            storedFile,
            userId,
            chatId,
        });

        expect(result).toEqual({ fileId });
    });

    it("should handle files with multiple dots in name", async () => {
        const storedFile = {
            fileId,
            name: "my.file.name.pdf",
            fileUrl: "https://example.com/my.file.name.pdf",
            mediaType: "application/pdf",
            extension: "pdf",
            size: 4096,
        };

        mocks.remove.mockResolvedValue({ error: null });

        const result = await deleteUserFile({
            storedFile,
            userId,
            chatId,
        });

        expect(result).toEqual({ fileId });
    });
});

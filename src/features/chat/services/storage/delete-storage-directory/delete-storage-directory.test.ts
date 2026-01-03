import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants/storage";
import type { DBChatId } from "@/features/chat/lib/types";
import { hashId } from "@/features/chat/services/storage/hash-id/hash-id";

import type { DBUserId } from "@/features/user/lib/types";

import { deleteStorageDirectory } from "./delete-storage-directory";

const userId = "00000000-0000-0000-0000-000000000001" as DBUserId;
const chatId = "30000000-0000-0000-0000-000000000001" as DBChatId;

const hashedChatId = hashId(chatId);

const mocks = vi.hoisted(() => ({
    list: vi.fn(),
    remove: vi.fn(),
    from: vi.fn(() => ({
        list: mocks.list,
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

describe("deleteStorageDirectory", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.from.mockReturnValue({
            list: mocks.list,
            remove: mocks.remove,
        });
    });

    it("deletes all files for a specific chat", async () => {
        mocks.list.mockResolvedValueOnce({
            data: [
                {
                    name: "file1.txt",
                    metadata: { size: 100 },
                },
                {
                    name: "file2.txt",
                    metadata: { size: 200 },
                },
            ],
            error: null,
        });

        mocks.remove.mockResolvedValue({ error: null });

        const result = await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
        });

        expect(result).toEqual({ userId, chatId });
    });

    it("deletes all files for a user when chatId is not provided", async () => {
        mocks.list
            .mockResolvedValueOnce({
                data: [
                    {
                        name: hashedChatId,
                        metadata: null,
                    },
                ],
                error: null,
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        name: "file1.txt",
                        metadata: { size: 100 },
                    },
                ],
                error: null,
            });

        mocks.remove.mockResolvedValue({ error: null });

        const result = await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
        });

        expect(result).toEqual({ userId, chatId: undefined });
    });

    it("handles recursive deletion of nested folders", async () => {
        mocks.list
            .mockResolvedValueOnce({
                data: [
                    {
                        name: "subfolder",
                        metadata: null,
                    },
                    {
                        name: "root-file.txt",
                        metadata: { size: 100 },
                    },
                ],
                error: null,
            })
            .mockResolvedValueOnce({
                data: [
                    {
                        name: "nested-file.txt",
                        metadata: { size: 200 },
                    },
                ],
                error: null,
            });

        mocks.remove.mockResolvedValue({ error: null });

        const result = await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
        });

        expect(result).toEqual({ userId, chatId });
    });

    it("handles empty directories gracefully", async () => {
        mocks.list.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.USER_FILES,
            userId,
            chatId,
        });

        expect(result).toEqual({ userId, chatId });
    });

    it("throws error when list fails", async () => {
        mocks.list.mockResolvedValue({
            data: null,
            error: { message: "Access denied" },
        });

        await expect(
            deleteStorageDirectory({
                bucket: STORAGE_BUCKET.USER_FILES,
                userId,
            }),
        ).rejects.toThrow("Failed to list");
    });

    it("throws error when delete fails", async () => {
        mocks.list.mockResolvedValue({
            data: [
                {
                    name: "file.txt",
                    metadata: { size: 100 },
                },
            ],
            error: null,
        });

        mocks.remove.mockResolvedValue({
            error: { message: "Delete failed" },
        });

        await expect(
            deleteStorageDirectory({
                bucket: STORAGE_BUCKET.USER_FILES,
                userId,
                chatId,
            }),
        ).rejects.toThrow("Failed to delete files from");
    });

    it("works with different buckets", async () => {
        mocks.list.mockResolvedValue({
            data: [],
            error: null,
        });

        const result = await deleteStorageDirectory({
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            userId,
        });

        expect(result).toEqual({ userId, chatId: undefined });
    });
});

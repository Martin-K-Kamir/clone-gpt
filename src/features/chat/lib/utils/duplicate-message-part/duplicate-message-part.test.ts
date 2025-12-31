import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { CHAT_TOOL, STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { ChatMessagePart, DBChatId } from "@/features/chat/lib/types";

import { duplicateMessagePart } from "./duplicate-message-part";

process.env.SUPABASE_STORAGE_URL = "https://storage.example.com";

vi.mock("@/features/chat/services/storage", () => ({
    duplicateStorageFile: vi.fn(),
}));

const mockStorageUrl = "https://storage.example.com";

describe("duplicateMessagePart", () => {
    const userId = "user-1" as any;
    const newChatId = "chat-2" as DBChatId;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should duplicate generate image tool part", async () => {
        const { duplicateStorageFile } = await import(
            "@/features/chat/services/storage"
        );

        vi.mocked(duplicateStorageFile).mockResolvedValue({
            name: "new-image.png",
            fileId: "123e4567-e89b-12d3-a456-426614174000",
            fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/new-image.png`,
        });

        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/old-image.png`,
                name: "old-image.png",
                id: "old-id",
            },
        } as any;

        const result = await duplicateMessagePart({
            part,
            userId,
            newChatId,
        });

        expect(result).toMatchObject({
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/new-image.png`,
                name: "new-image.png",
                id: "123e4567-e89b-12d3-a456-426614174000",
            },
        });
    });

    it("should duplicate generate file tool part", async () => {
        const { duplicateStorageFile } = await import(
            "@/features/chat/services/storage"
        );

        vi.mocked(duplicateStorageFile).mockResolvedValue({
            name: "new-file.js",
            fileId: "123e4567-e89b-12d3-a456-426614174002",
            fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/new-file.js`,
        });

        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/old-file.js`,
                name: "old-file.js",
                extension: "js",
            },
        } as any;

        const result = await duplicateMessagePart({
            part,
            userId,
            newChatId,
        });

        expect(result).toMatchObject({
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/new-file.js`,
                name: "new-file.js",
                id: "123e4567-e89b-12d3-a456-426614174002",
            },
        });
    });

    it("should duplicate user file message part", async () => {
        const { duplicateStorageFile } = await import(
            "@/features/chat/services/storage"
        );

        vi.mocked(duplicateStorageFile).mockResolvedValue({
            name: "new-document.pdf",
            fileId: "123e4567-e89b-12d3-a456-426614174003",
            fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/new-document.pdf`,
        });

        const part = {
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/old-document.pdf`,
            name: "old-document.pdf",
            extension: "pdf",
            mediaType: "application/pdf",
            size: 1024,
        } as any;

        const result = await duplicateMessagePart({
            part,
            userId,
            newChatId,
        });

        expect(result).toMatchObject({
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/new-document.pdf`,
            name: "old-document.pdf",
            extension: "pdf",
            mediaType: "application/pdf",
            size: 1024,
        });
    });

    it("should return text part unchanged", async () => {
        const part = {
            type: "text",
            text: "Hello world",
        } as any;

        const result = await duplicateMessagePart({
            part,
            userId,
            newChatId,
        });

        expect(result).toBe(part);
    });

    it("should return other tool parts unchanged", async () => {
        const part = {
            type: CHAT_TOOL.GET_WEATHER,
            input: { location: "New York" },
            output: { temperature: 72 },
        } as any;

        const result = await duplicateMessagePart({
            part,
            userId,
            newChatId,
        });

        expect(result).toBe(part);
    });

    it("should preserve all properties when duplicating image part", async () => {
        const { duplicateStorageFile } = await import(
            "@/features/chat/services/storage"
        );

        vi.mocked(duplicateStorageFile).mockResolvedValue({
            name: "new-image.png",
            fileId: "123e4567-e89b-12d3-a456-426614174001",
            fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/new-image.png`,
        });

        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            input: { prompt: "A cat" },
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/old-image.png`,
                name: "old-image.png",
                id: "old-id",
            },
        } as any;

        const result = await duplicateMessagePart({
            part,
            userId,
            newChatId,
        });

        expect(result).toMatchObject({
            type: CHAT_TOOL.GENERATE_IMAGE,
            input: { prompt: "A cat" },
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/new-image.png`,
                name: "new-image.png",
                id: "123e4567-e89b-12d3-a456-426614174001",
            },
        });
    });

    describe("type checking", () => {
        it("should return ChatMessagePart", async () => {
            const { duplicateStorageFile } = await import(
                "@/features/chat/services/storage"
            );

            vi.mocked(duplicateStorageFile).mockResolvedValue({
                name: "new-file.pdf",
                fileId: "123e4567-e89b-12d3-a456-426614174000",
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/new-file.pdf`,
            });

            const part = {
                type: "file",
                url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/old-file.pdf`,
                name: "old-file.pdf",
                extension: "pdf",
                mediaType: "application/pdf",
            } as any;

            const result = await duplicateMessagePart({
                part,
                userId,
                newChatId,
            });

            expectTypeOf(result).toEqualTypeOf<ChatMessagePart>();
        });
    });
});

import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { ChatUploadedFile } from "@/features/chat/lib/types";

import { createUserMessage } from "./create-user-message";

vi.mock("../convert-files-to-message-parts", () => ({
    convertFilesToMessageParts: vi.fn(
        ({
            uploadedFiles,
            filesPreview,
        }: {
            uploadedFiles: ChatUploadedFile[];
            filesPreview: File[];
        }) => {
            return uploadedFiles
                .filter((file: ChatUploadedFile) =>
                    filesPreview.some(
                        (preview: File) => preview.name === file.name,
                    ),
                )
                .map((file: ChatUploadedFile) => ({
                    kind: file.kind,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: file.name,
                    url: file.fileUrl,
                    mediaType: file.mediaType,
                    size: file.size,
                    extension: file.extension,
                }));
        },
    ),
}));

describe("createUserMessage", () => {
    it("should create message with text part only", () => {
        const text = "Hello world";
        const uploadedFiles: ChatUploadedFile[] = [];
        const selectedFiles: File[] = [];

        const result = createUserMessage(text, uploadedFiles, selectedFiles);

        expect(result).toMatchObject({
            role: CHAT_ROLE.USER,
            metadata: {
                role: CHAT_ROLE.USER,
            },
            parts: [
                {
                    text: "Hello world",
                    type: CHAT_MESSAGE_TYPE.TEXT,
                },
            ],
        });
        expect(result.metadata.createdAt).toBeDefined();
        expect(typeof result.metadata.createdAt).toBe("string");
    });

    it("should include file parts when files are provided", () => {
        const text = "Check this file";
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-1",
                name: "document.pdf",
                fileUrl: "https://example.com/document.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 1024,
            },
        ];
        const selectedFiles: File[] = [
            new File(["content"], "document.pdf", { type: "application/pdf" }),
        ];

        const result = createUserMessage(text, uploadedFiles, selectedFiles);

        expect(result.parts).toHaveLength(2);
        expect(result.parts[0]).toMatchObject({
            text: "Check this file",
            type: CHAT_MESSAGE_TYPE.TEXT,
        });
        expect(result.parts[1]).toMatchObject({
            kind: CHAT_MESSAGE_TYPE.FILE,
            type: CHAT_MESSAGE_TYPE.FILE,
            name: "document.pdf",
        });
    });

    it("should filter out files not in selectedFiles", () => {
        const text = "Message";
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-1",
                name: "document1.pdf",
                fileUrl: "https://example.com/document1.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 1024,
            },
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-2",
                name: "document2.pdf",
                fileUrl: "https://example.com/document2.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 2048,
            },
        ];
        const selectedFiles: File[] = [
            new File(["content"], "document1.pdf", { type: "application/pdf" }),
        ];

        const result = createUserMessage(text, uploadedFiles, selectedFiles);

        expect(result.parts).toHaveLength(2); // text + 1 file
        expect("name" in result.parts[1] && result.parts[1].name).toBe(
            "document1.pdf",
        );
    });

    it("should set role to USER", () => {
        const text = "Test";
        const uploadedFiles: ChatUploadedFile[] = [];
        const selectedFiles: File[] = [];

        const result = createUserMessage(text, uploadedFiles, selectedFiles);

        expect(result.role).toBe(CHAT_ROLE.USER);
        expect(result.metadata.role).toBe(CHAT_ROLE.USER);
    });

    it("should set createdAt timestamp in metadata", () => {
        const text = "Test";
        const uploadedFiles: ChatUploadedFile[] = [];
        const selectedFiles: File[] = [];

        const before = new Date().toISOString();
        const result = createUserMessage(text, uploadedFiles, selectedFiles);
        const after = new Date().toISOString();

        expect(result.metadata.createdAt).toBeDefined();
        expect(result.metadata.createdAt >= before).toBe(true);
        expect(result.metadata.createdAt <= after).toBe(true);
    });

    it("should handle empty text", () => {
        const text = "";
        const uploadedFiles: ChatUploadedFile[] = [];
        const selectedFiles: File[] = [];

        const result = createUserMessage(text, uploadedFiles, selectedFiles);

        const firstPart = result.parts[0];
        if ("text" in firstPart) {
            expect(firstPart.text).toBe("");
        }
    });

    it("should handle multiple files", () => {
        const text = "Multiple files";
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-1",
                name: "file1.pdf",
                fileUrl: "https://example.com/file1.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 1024,
            },
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                fileId: "file-2",
                name: "image.png",
                fileUrl: "https://example.com/image.png",
                mediaType: "image/png",
                extension: "png",
                size: 2048,
                width: 100,
                height: 200,
            },
        ];
        const selectedFiles: File[] = [
            new File(["content"], "file1.pdf", { type: "application/pdf" }),
            new File(["content"], "image.png", { type: "image/png" }),
        ];

        const result = createUserMessage(text, uploadedFiles, selectedFiles);

        expect(result.parts).toHaveLength(3); // text + 2 files
        const firstPart = result.parts[0];
        if ("type" in firstPart) {
            expect(firstPart.type).toBe(CHAT_MESSAGE_TYPE.TEXT);
        }
    });

    describe("type checking", () => {
        it("should return UIChatMessage", () => {
            const text = "Hello world";
            const uploadedFiles: ChatUploadedFile[] = [];
            const selectedFiles: File[] = [];

            const result = createUserMessage(
                text,
                uploadedFiles,
                selectedFiles,
            );

            expectTypeOf(result).toMatchTypeOf<{
                role: string;
                metadata: object;
                parts: unknown[];
            }>();
        });
    });
});

import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { ChatUploadedFile } from "@/features/chat/lib/types";

import { convertFilesToMessageParts } from "./convert-files-to-message-parts";

describe("convertFilesToMessageParts", () => {
    it("should return empty array when no files match preview", () => {
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
        ];

        const filesPreview: File[] = [
            new File(["content"], "file2.pdf", { type: "application/pdf" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toEqual([]);
    });

    it("should convert FILE kind files to message parts", () => {
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
        ];

        const filesPreview: File[] = [
            new File(["content"], "file1.pdf", { type: "application/pdf" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toEqual([
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "file1.pdf",
                url: "https://example.com/file1.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 1024,
            },
        ]);
    });

    it("should convert IMAGE kind files to message parts", () => {
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                fileId: "image-1",
                name: "image1.png",
                fileUrl: "https://example.com/image1.png",
                mediaType: "image/png",
                extension: "png",
                size: 2048,
                width: 100,
                height: 200,
            },
        ];

        const filesPreview: File[] = [
            new File(["content"], "image1.png", { type: "image/png" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toEqual([
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "image1.png",
                url: "https://example.com/image1.png",
                mediaType: "image/png",
                extension: "png",
                size: 2048,
                width: 100,
                height: 200,
            },
        ]);
    });

    it("should convert TEXT kind files to message parts", () => {
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.TEXT,
                fileId: "text-1",
                name: "document.txt",
                fileUrl: "https://example.com/document.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 512,
                text: "File content here",
            },
        ];

        const filesPreview: File[] = [
            new File(["content"], "document.txt", { type: "text/plain" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toEqual([
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.TEXT,
                name: "document.txt",
                url: "https://example.com/document.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 512,
                text: "Here is the user uploaded file: document.txt and the file content: File content here",
                isVisible: false,
            },
        ]);
    });

    it("should handle multiple files of different kinds", () => {
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
                fileId: "image-1",
                name: "image1.png",
                fileUrl: "https://example.com/image1.png",
                mediaType: "image/png",
                extension: "png",
                size: 2048,
                width: 100,
                height: 200,
            },
            {
                kind: CHAT_MESSAGE_TYPE.TEXT,
                fileId: "text-1",
                name: "document.txt",
                fileUrl: "https://example.com/document.txt",
                mediaType: "text/plain",
                extension: "txt",
                size: 512,
                text: "File content",
            },
        ];

        const filesPreview: File[] = [
            new File(["content"], "file1.pdf", { type: "application/pdf" }),
            new File(["content"], "image1.png", { type: "image/png" }),
            new File(["content"], "document.txt", { type: "text/plain" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toMatchObject({
            kind: CHAT_MESSAGE_TYPE.FILE,
            type: CHAT_MESSAGE_TYPE.FILE,
            name: "file1.pdf",
        });
        expect(result[1]).toMatchObject({
            kind: CHAT_MESSAGE_TYPE.IMAGE,
            type: CHAT_MESSAGE_TYPE.FILE,
            name: "image1.png",
            width: 100,
            height: 200,
        });
        expect(result[2]).toMatchObject({
            kind: CHAT_MESSAGE_TYPE.FILE,
            type: CHAT_MESSAGE_TYPE.TEXT,
            name: "document.txt",
            isVisible: false,
        });
    });

    it("should filter out files not in preview", () => {
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
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-2",
                name: "file2.pdf",
                fileUrl: "https://example.com/file2.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 2048,
            },
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-3",
                name: "file3.pdf",
                fileUrl: "https://example.com/file3.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 3072,
            },
        ];

        const filesPreview: File[] = [
            new File(["content"], "file1.pdf", { type: "application/pdf" }),
            new File(["content"], "file3.pdf", { type: "application/pdf" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("file1.pdf");
        expect(result[1].name).toBe("file3.pdf");
    });

    it("should handle image files with null width and height", () => {
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                fileId: "image-1",
                name: "image1.png",
                fileUrl: "https://example.com/image1.png",
                mediaType: "image/png",
                extension: "png",
                size: 2048,
                width: null,
                height: null,
            },
        ];

        const filesPreview: File[] = [
            new File(["content"], "image1.png", { type: "image/png" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result).toEqual([
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "image1.png",
                url: "https://example.com/image1.png",
                mediaType: "image/png",
                extension: "png",
                size: 2048,
                width: null,
                height: null,
            },
        ]);
    });

    it("should preserve all base properties for all file kinds", () => {
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                fileId: "file-1",
                name: "test.pdf",
                fileUrl: "https://example.com/test.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 5000,
            },
        ];

        const filesPreview: File[] = [
            new File(["content"], "test.pdf", { type: "application/pdf" }),
        ];

        const result = convertFilesToMessageParts({
            uploadedFiles,
            filesPreview,
        });

        expect(result[0]).toMatchObject({
            size: 5000,
            extension: "pdf",
            mediaType: "application/pdf",
            url: "https://example.com/test.pdf",
            name: "test.pdf",
        });
    });
});

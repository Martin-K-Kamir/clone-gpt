import { generateMessageId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

import { checkForFilesInMessage } from "./check-for-files-in-message";

describe("checkForFilesInMessage", () => {
    it("should return false for message with no file parts", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Hello world",
                },
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(false);
    });

    it("should return true when file part has kind property", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Hello world",
                },
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "file1.pdf",
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                    size: 1024,
                    extension: "pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return true when file part has type property", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Hello world",
                },
                {
                    type: CHAT_MESSAGE_TYPE.FILE,
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return true for image parts with kind property", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "image1.png",
                    url: "https://example.com/image1.png",
                    mediaType: "image/png",
                    size: 1024,
                    extension: "png",
                    width: 100,
                    height: 100,
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return false for empty parts array", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(false);
    });

    it("should return false when only text parts exist", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "First text",
                },
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Second text",
                },
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Third text",
                },
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(false);
    });

    it("should return true when file part appears after text parts", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Hello",
                },
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "World",
                },
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "file1.pdf",
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                    size: 1024,
                    extension: "pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return true when file part appears before text parts", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.FILE,
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                } as any,
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Hello",
                },
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "World",
                },
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return true for mixed parts with files", () => {
        const message = {
            id: generateMessageId(),
            role: CHAT_ROLE.USER,
            parts: [
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "Hello",
                },
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "file1.pdf",
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                    size: 1024,
                    extension: "pdf",
                } as any,
                {
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    text: "World",
                },
                {
                    type: CHAT_MESSAGE_TYPE.FILE,
                    url: "https://example.com/file2.pdf",
                    mediaType: "application/pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });
});

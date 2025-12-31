import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { checkForFilesInMessage } from "./check-for-files-in-message";

describe("checkForFilesInMessage", () => {
    it("should return false for message with no file parts", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "Hello world",
                },
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(false);
    });

    it("should return true when file part has kind property", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
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
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "Hello world",
                },
                {
                    type: "file",
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return true for image parts with kind property", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
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
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(false);
    });

    it("should return false when only text parts exist", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "First text",
                },
                {
                    type: "text",
                    text: "Second text",
                },
                {
                    type: "text",
                    text: "Third text",
                },
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(false);
    });

    it("should return true when file part appears after text parts", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "Hello",
                },
                {
                    type: "text",
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
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "file",
                    url: "https://example.com/file1.pdf",
                    mediaType: "application/pdf",
                } as any,
                {
                    type: "text",
                    text: "Hello",
                },
                {
                    type: "text",
                    text: "World",
                },
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });

    it("should return true for mixed parts with files", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
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
                    type: "text",
                    text: "World",
                },
                {
                    type: "file",
                    url: "https://example.com/file2.pdf",
                    mediaType: "application/pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(checkForFilesInMessage(message)).toBe(true);
    });
});

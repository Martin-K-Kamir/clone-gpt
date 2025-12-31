import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { countFilesInMessage } from "./count-files-in-message";

describe("countFilesInMessage", () => {
    it("should return 0 for message with no file parts", () => {
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

        expect(countFilesInMessage(message)).toBe(0);
    });

    it("should count file parts with kind property", () => {
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
                {
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "file2.pdf",
                    url: "https://example.com/file2.pdf",
                    mediaType: "application/pdf",
                    size: 2048,
                    extension: "pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(countFilesInMessage(message)).toBe(2);
    });

    it("should count file parts with type property", () => {
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

        expect(countFilesInMessage(message)).toBe(1);
    });

    it("should count both kind and type file parts", () => {
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
                {
                    type: "file",
                    url: "https://example.com/file2.pdf",
                    mediaType: "application/pdf",
                } as any,
            ],
        } as UIChatMessage;

        expect(countFilesInMessage(message)).toBe(2);
    });

    it("should count image parts with kind property", () => {
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

        expect(countFilesInMessage(message)).toBe(1);
    });

    it("should return 0 for empty parts array", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [],
        } as UIChatMessage;

        expect(countFilesInMessage(message)).toBe(0);
    });

    it("should not count text parts", () => {
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

        expect(countFilesInMessage(message)).toBe(0);
    });

    it("should handle mixed parts correctly", () => {
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
                {
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    name: "image1.png",
                    url: "https://example.com/image1.png",
                    mediaType: "image/png",
                    size: 3072,
                    extension: "png",
                    width: 200,
                    height: 200,
                } as any,
            ],
        } as UIChatMessage;

        expect(countFilesInMessage(message)).toBe(3);
    });
});

import { describe, expect, it } from "vitest";

import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { createChatTitleFromMessage } from "./create-chat-title-from-message";

describe("createChatTitleFromMessage", () => {
    it("should return text part content when text is shorter than max length", () => {
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

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("Hello world");
    });

    it("should truncate text part content when longer than max length", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "This is a very long message that exceeds the maximum title length",
                },
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("This is a very long messa...");
        expect(result.length).toBe(28); // 25 chars + "..."
    });

    it("should use default title when no text part exists", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "file",
                    url: "https://example.com/file.pdf",
                    mediaType: "application/pdf",
                } as any,
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("New Chat");
    });

    it("should use default title when parts array is empty", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("New Chat");
    });

    it("should use custom default title when provided", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message, {
            defaultTitle: "Custom Default",
        });

        expect(result).toBe("Custom Default");
    });

    it("should use custom max title length when provided", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "This is a long message",
                },
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message, {
            maxTitleLength: 10,
        });

        expect(result).toBe("This is a ...");
        expect(result.length).toBe(13); // 10 chars + "..."
    });

    it("should handle text part at different positions", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "file",
                    url: "https://example.com/file.pdf",
                    mediaType: "application/pdf",
                } as any,
                {
                    type: "text",
                    text: "Hello",
                },
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("Hello");
    });

    it("should use first text part when multiple text parts exist", () => {
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
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("First text");
    });

    it("should handle text exactly at max length", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "1234567890123456789012345", // 25 characters
                },
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("1234567890123456789012345");
        expect(result.length).toBe(25);
    });

    it("should handle text one character over max length", () => {
        const message = {
            id: "msg-1" as DBChatMessageId,
            role: "user",
            parts: [
                {
                    type: "text",
                    text: "12345678901234567890123456", // 26 characters
                },
            ],
        } as UIChatMessage;

        const result = createChatTitleFromMessage(message);

        expect(result).toBe("1234567890123456789012345...");
        expect(result.length).toBe(28); // 25 chars + "..."
    });
});

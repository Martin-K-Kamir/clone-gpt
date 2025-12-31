import { describe, expect, it } from "vitest";

import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { findMessageIndex } from "./find-message-index";

describe("findMessageIndex", () => {
    it("should return index when message found", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: "assistant",
                parts: [{ type: "text", text: "Hi there" }],
            },
        ];

        const result = findMessageIndex(messages, "msg-2");

        expect(result).toBe(1);
    });

    it("should return -1 when message not found", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "Hello" }],
            },
        ];

        const result = findMessageIndex(messages, "msg-999");

        expect(result).toBe(-1);
    });

    it("should return -1 when messages array is empty", () => {
        const messages: UIChatMessage[] = [];

        const result = findMessageIndex(messages, "msg-1");

        expect(result).toBe(-1);
    });

    it("should return first matching index when multiple messages have same id", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "First" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "Second" }],
            },
            {
                id: "msg-1" as DBChatMessageId,
                role: "assistant",
                parts: [{ type: "text", text: "Third" }],
            },
        ];

        const result = findMessageIndex(messages, "msg-1");

        expect(result).toBe(0);
    });

    it("should return 0 for first message", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "First" }],
            },
        ];

        const result = findMessageIndex(messages, "msg-1");

        expect(result).toBe(0);
    });
});

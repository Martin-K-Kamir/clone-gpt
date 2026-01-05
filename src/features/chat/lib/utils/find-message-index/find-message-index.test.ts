import { generateMessageId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { findMessageIndex } from "./find-message-index";

describe("findMessageIndex", () => {
    it("should return index when message found", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            },
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi there" }],
            },
        ];

        const result = findMessageIndex(messages, messageId2);

        expect(result).toBe(1);
    });

    it("should return -1 when message not found", () => {
        const messageId = generateMessageId();
        const notFoundId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            },
        ];

        const result = findMessageIndex(messages, notFoundId);

        expect(result).toBe(-1);
    });

    it("should return -1 when messages array is empty", () => {
        const messages: UIChatMessage[] = [];
        const messageId = generateMessageId();

        const result = findMessageIndex(messages, messageId);

        expect(result).toBe(-1);
    });

    it("should return first matching index when multiple messages have same id", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "First" }],
            },
            {
                id: messageId2,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Second" }],
            },
            {
                id: messageId1,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Third" }],
            },
        ];

        const result = findMessageIndex(messages, messageId1);

        expect(result).toBe(0);
    });

    it("should return 0 for first message", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "First" }],
            },
        ];

        const result = findMessageIndex(messages, messageId);

        expect(result).toBe(0);
    });
});

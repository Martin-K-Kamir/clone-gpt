import { generateMessageId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { findNextAssistantMessage } from "./find-next-assistant-message";

describe("findNextAssistantMessage", () => {
    it("should return next assistant message after given index", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messageId3 = generateMessageId();
        const messageId4 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            },
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi" }],
            },
            {
                id: messageId3,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "How are you?" }],
            },
            {
                id: messageId4,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "I'm fine" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toEqual(messages[1]);
    });

    it("should return undefined when no assistant message exists after index", () => {
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
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toBeUndefined();
    });

    it("should return undefined when index is at last message", () => {
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
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 1);

        expect(result).toBeUndefined();
    });

    it("should skip user messages and return first assistant message", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messageId3 = generateMessageId();
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
                id: messageId3,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Third" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toEqual(messages[2]);
    });

    it("should return first assistant message when multiple exist after index", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messageId3 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            },
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "First assistant" },
                ],
            },
            {
                id: messageId3,
                role: CHAT_ROLE.ASSISTANT,
                parts: [
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "Second assistant" },
                ],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toEqual(messages[1]);
    });

    it("should return undefined when messages array is empty", () => {
        const messages: UIChatMessage[] = [];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toBeUndefined();
    });

    it("should return first assistant message when index is negative", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            },
        ];

        const result = findNextAssistantMessage(messages, -1);

        expect(result).toEqual(messages[0]);
    });

    it("should not return message at the same index", () => {
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
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 1);

        expect(result).toBeUndefined();
    });

    describe("type checking", () => {
        it("should return UIChatMessage or undefined", () => {
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
                    parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi" }],
                },
            ];

            const result = findNextAssistantMessage(messages, 0);

            expectTypeOf(result).toEqualTypeOf<UIChatMessage | undefined>();
        });
    });
});

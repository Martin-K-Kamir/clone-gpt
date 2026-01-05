import { generateMessageId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

import { findMessageById } from "./find-message-by-id";

describe("findMessageById", () => {
    it("should return message when found", () => {
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

        const result = findMessageById(messages, messageId2);

        expect(result).toEqual(messages[1]);
    });

    it("should return undefined when message not found", () => {
        const messageId = generateMessageId();
        const notFoundId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            },
        ];

        const result = findMessageById(messages, notFoundId);

        expect(result).toBeUndefined();
    });

    it("should return undefined when messages array is empty", () => {
        const messages: UIChatMessage[] = [];
        const messageId = generateMessageId();

        const result = findMessageById(messages, messageId);

        expect(result).toBeUndefined();
    });

    it("should return first matching message when multiple messages exist", () => {
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

        const result = findMessageById(messages, messageId1);

        expect(result).toEqual(messages[0]);
    });

    describe("type checking", () => {
        it("should return UIChatMessage or undefined", () => {
            const messageId = generateMessageId();
            const messages: UIChatMessage[] = [
                {
                    id: messageId,
                    role: CHAT_ROLE.USER,
                    parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
                },
            ];

            const result = findMessageById(messages, messageId);

            expectTypeOf(result).toEqualTypeOf<UIChatMessage | undefined>();
        });
    });
});

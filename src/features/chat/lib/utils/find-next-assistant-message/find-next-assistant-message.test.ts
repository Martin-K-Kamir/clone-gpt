import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_ROLE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { findNextAssistantMessage } from "./find-next-assistant-message";

describe("findNextAssistantMessage", () => {
    it("should return next assistant message after given index", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Hi" }],
            },
            {
                id: "msg-3" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "How are you?" }],
            },
            {
                id: "msg-4" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "I'm fine" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toEqual(messages[1]);
    });

    it("should return undefined when no assistant message exists after index", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hi" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toBeUndefined();
    });

    it("should return undefined when index is at last message", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Hi" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 1);

        expect(result).toBeUndefined();
    });

    it("should skip user messages and return first assistant message", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "First" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Second" }],
            },
            {
                id: "msg-3" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Third" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 0);

        expect(result).toEqual(messages[2]);
    });

    it("should return first assistant message when multiple exist after index", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "First assistant" }],
            },
            {
                id: "msg-3" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Second assistant" }],
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
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Hello" }],
            },
        ];

        const result = findNextAssistantMessage(messages, -1);

        expect(result).toEqual(messages[0]);
    });

    it("should not return message at the same index", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Hi" }],
            },
        ];

        const result = findNextAssistantMessage(messages, 1);

        expect(result).toBeUndefined();
    });

    describe("type checking", () => {
        it("should return UIChatMessage or undefined", () => {
            const messages: UIChatMessage[] = [
                {
                    id: "msg-1" as DBChatMessageId,
                    role: CHAT_ROLE.USER,
                    parts: [{ type: "text", text: "Hello" }],
                },
                {
                    id: "msg-2" as DBChatMessageId,
                    role: CHAT_ROLE.ASSISTANT,
                    parts: [{ type: "text", text: "Hi" }],
                },
            ];

            const result = findNextAssistantMessage(messages, 0);

            expectTypeOf(result).toEqualTypeOf<UIChatMessage | undefined>();
        });
    });
});

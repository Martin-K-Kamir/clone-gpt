import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_ROLE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { findMessageById } from "./find-message-by-id";

describe("findMessageById", () => {
    it("should return message when found", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Hi there" }],
            },
        ];

        const result = findMessageById(messages, "msg-2");

        expect(result).toEqual(messages[1]);
    });

    it("should return undefined when message not found", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Hello" }],
            },
        ];

        const result = findMessageById(messages, "msg-999");

        expect(result).toBeUndefined();
    });

    it("should return undefined when messages array is empty", () => {
        const messages: UIChatMessage[] = [];

        const result = findMessageById(messages, "msg-1");

        expect(result).toBeUndefined();
    });

    it("should return first matching message when multiple messages exist", () => {
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
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Third" }],
            },
        ];

        const result = findMessageById(messages, "msg-1");

        expect(result).toEqual(messages[0]);
    });

    describe("type checking", () => {
        it("should return UIChatMessage or undefined", () => {
            const messages: UIChatMessage[] = [
                {
                    id: "msg-1" as DBChatMessageId,
                    role: CHAT_ROLE.USER,
                    parts: [{ type: "text", text: "Hello" }],
                },
            ];

            const result = findMessageById(messages, "msg-1");

            expectTypeOf(result).toEqualTypeOf<UIChatMessage | undefined>();
        });
    });
});

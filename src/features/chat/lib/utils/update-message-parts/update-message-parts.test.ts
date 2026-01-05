import { generateMessageId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

import { updateMessageParts } from "./update-message-parts";

describe("updateMessageParts", () => {
    it("should update parts for matching message ID", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "Old text" },
                    {
                        type: CHAT_MESSAGE_TYPE.FILE,
                        url: "https://example.com/file.pdf",
                    } as any,
                ],
            },
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Response" }],
            },
        ];

        const result = updateMessageParts(messages, messageId1, "New text");

        expect(result[0].parts).toEqual([
            {
                text: "New text",
                type: CHAT_MESSAGE_TYPE.TEXT,
            },
        ]);
        expect(result[0].id).toBe(messageId1);
        expect(result[1].parts).toEqual(messages[1].parts);
    });

    it("should not modify messages with non-matching IDs", () => {
        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const notFoundId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Original" }],
            },
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Response" }],
            },
        ];

        const result = updateMessageParts(messages, notFoundId, "New text");

        expect(result).toEqual(messages);
    });

    it("should preserve all message properties except parts", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Old" }],
                metadata: {
                    role: CHAT_ROLE.USER,
                    createdAt: new Date().toISOString(),
                },
            },
        ];

        const result = updateMessageParts(messages, messageId, "New");

        expect(result[0].id).toBe(messageId);
        expect(result[0].role).toBe(CHAT_ROLE.USER);
        expect(result[0].metadata).toEqual(messages[0].metadata);
        expect(result[0].parts).toEqual([
            { text: "New", type: CHAT_MESSAGE_TYPE.TEXT },
        ]);
    });

    it("should handle empty messages array", () => {
        const messages: UIChatMessage[] = [];
        const messageId = generateMessageId();

        const result = updateMessageParts(messages, messageId, "New text");

        expect(result).toEqual([]);
    });

    it("should handle empty newText", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Old" }],
            },
        ];

        const result = updateMessageParts(messages, messageId, "");

        expect(result[0].parts).toEqual([
            { text: "", type: CHAT_MESSAGE_TYPE.TEXT },
        ]);
    });

    it("should replace multiple parts with single text part", () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "First" },
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "Second" },
                    {
                        type: CHAT_MESSAGE_TYPE.FILE,
                        url: "https://example.com/file.pdf",
                    } as any,
                ],
            },
        ];

        const result = updateMessageParts(messages, messageId, "Single text");

        expect(result[0].parts).toHaveLength(1);
        expect(result[0].parts[0]).toEqual({
            text: "Single text",
            type: CHAT_MESSAGE_TYPE.TEXT,
        });
    });

    it("should handle multiple messages and update only matching one", () => {
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

        const result = updateMessageParts(messages, messageId2, "Updated");

        const firstPart = result[0].parts[0];
        const secondPart = result[1].parts[0];
        const thirdPart = result[2].parts[0];

        if ("text" in firstPart) {
            expect(firstPart.text).toBe("First");
        }
        if ("text" in secondPart) {
            expect(secondPart.text).toBe("Updated");
        }
        if ("text" in thirdPart) {
            expect(thirdPart.text).toBe("Third");
        }
    });
});

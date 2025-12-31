import { describe, expect, it } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { DBChatMessageId, UIChatMessage } from "@/features/chat/lib/types";

import { updateMessageParts } from "./update-message-parts";

describe("updateMessageParts", () => {
    it("should update parts for matching message ID", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [
                    { type: "text", text: "Old text" },
                    {
                        type: "file",
                        url: "https://example.com/file.pdf",
                    } as any,
                ],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Response" }],
            },
        ];

        const result = updateMessageParts(messages, "msg-1", "New text");

        expect(result[0].parts).toEqual([
            {
                text: "New text",
                type: CHAT_MESSAGE_TYPE.TEXT,
            },
        ]);
        expect(result[0].id).toBe("msg-1");
        expect(result[1].parts).toEqual(messages[1].parts);
    });

    it("should not modify messages with non-matching IDs", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Original" }],
            },
            {
                id: "msg-2" as DBChatMessageId,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: "text", text: "Response" }],
            },
        ];

        const result = updateMessageParts(messages, "msg-999", "New text");

        expect(result).toEqual(messages);
    });

    it("should preserve all message properties except parts", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Old" }],
                metadata: {
                    role: CHAT_ROLE.USER,
                    createdAt: new Date().toISOString(),
                },
            },
        ];

        const result = updateMessageParts(messages, "msg-1", "New");

        expect(result[0].id).toBe("msg-1");
        expect(result[0].role).toBe(CHAT_ROLE.USER);
        expect(result[0].metadata).toEqual(messages[0].metadata);
        expect(result[0].parts).toEqual([
            { text: "New", type: CHAT_MESSAGE_TYPE.TEXT },
        ]);
    });

    it("should handle empty messages array", () => {
        const messages: UIChatMessage[] = [];

        const result = updateMessageParts(messages, "msg-1", "New text");

        expect(result).toEqual([]);
    });

    it("should handle empty newText", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: "text", text: "Old" }],
            },
        ];

        const result = updateMessageParts(messages, "msg-1", "");

        expect(result[0].parts).toEqual([
            { text: "", type: CHAT_MESSAGE_TYPE.TEXT },
        ]);
    });

    it("should replace multiple parts with single text part", () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: CHAT_ROLE.USER,
                parts: [
                    { type: "text", text: "First" },
                    { type: "text", text: "Second" },
                    {
                        type: "file",
                        url: "https://example.com/file.pdf",
                    } as any,
                ],
            },
        ];

        const result = updateMessageParts(messages, "msg-1", "Single text");

        expect(result[0].parts).toHaveLength(1);
        expect(result[0].parts[0]).toEqual({
            text: "Single text",
            type: CHAT_MESSAGE_TYPE.TEXT,
        });
    });

    it("should handle multiple messages and update only matching one", () => {
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

        const result = updateMessageParts(messages, "msg-2", "Updated");

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

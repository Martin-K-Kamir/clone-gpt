import {
    generateChatId,
    generateMessageId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

import { duplicateMessages } from "./duplicate-messages";

vi.mock("../duplicate-message-metadata", () => ({
    duplicateMessageMetadata: vi.fn(metadata => metadata),
}));

vi.mock("../duplicate-message-parts", () => ({
    duplicateMessageParts: vi.fn(({ parts }) => Promise.resolve(parts)),
}));

describe("duplicateMessages", () => {
    const userId = generateUserId();
    const newChatId = generateChatId();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should duplicate messages with new IDs", async () => {
        const uuid1 = generateMessageId();
        const uuid2 = generateMessageId();
        let callCount = 0;
        const uuidGenerator = vi.fn(() => {
            callCount++;
            return callCount === 1 ? uuid1 : uuid2;
        });
        vi.spyOn(global.crypto, "randomUUID").mockImplementation(uuidGenerator);

        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            } as UIChatMessage,
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hi there" }],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(uuid1);
        expect(result[1].id).toBe(uuid2);
        expect(result[0].role).toBe(CHAT_ROLE.USER);
        expect(result[1].role).toBe(CHAT_ROLE.ASSISTANT);
    });

    it("should duplicate metadata for each message", async () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                metadata: {
                    role: CHAT_ROLE.USER,
                    createdAt: new Date().toISOString(),
                },
                parts: [],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result[0].metadata).toEqual(messages[0].metadata);
        expect(result[0].id).not.toBe(messages[0].id);
    });

    it("should duplicate parts for each message", async () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" }],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result[0].parts).toEqual(messages[0].parts);
        expect(result[0].id).not.toBe(messages[0].id);
    });

    it("should preserve all message properties except id", async () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [{ type: CHAT_MESSAGE_TYPE.TEXT, text: "Test" }],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result[0].role).toBe(CHAT_ROLE.USER);
        expect(result[0].parts).toEqual(messages[0].parts);
        expect(result[0].id).not.toBe(messages[0].id);
    });

    it("should handle empty messages array", async () => {
        const result = await duplicateMessages({
            messages: [],
            userId,
            newChatId,
        });

        expect(result).toEqual([]);
    });

    it("should generate unique IDs for each message", async () => {
        const uuid1 = generateMessageId();
        const uuid2 = generateMessageId();
        let callCount = 0;
        const uuidGenerator = vi.fn(() => {
            callCount++;
            return callCount === 1 ? uuid1 : uuid2;
        });
        vi.spyOn(global.crypto, "randomUUID").mockImplementation(uuidGenerator);

        const messageId1 = generateMessageId();
        const messageId2 = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId1,
                role: CHAT_ROLE.USER,
                parts: [],
            } as UIChatMessage,
            {
                id: messageId2,
                role: CHAT_ROLE.ASSISTANT,
                parts: [],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result[0].id).toBe(uuid1);
        expect(result[1].id).toBe(uuid2);
    });

    it("should handle messages with multiple parts", async () => {
        const messageId = generateMessageId();
        const messages: UIChatMessage[] = [
            {
                id: messageId,
                role: CHAT_ROLE.USER,
                parts: [
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" },
                    { type: CHAT_MESSAGE_TYPE.TEXT, text: "World" },
                ],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result[0].parts).toHaveLength(2);
    });

    describe("type checking", () => {
        it("should return UIChatMessage array", async () => {
            const messageId = generateMessageId();
            const messages: UIChatMessage[] = [
                {
                    id: messageId,
                    role: CHAT_ROLE.USER,
                    parts: [],
                } as UIChatMessage,
            ];

            const result = await duplicateMessages({
                messages,
                userId,
                newChatId,
            });

            expectTypeOf(result).toEqualTypeOf<UIChatMessage[]>();
        });
    });
});

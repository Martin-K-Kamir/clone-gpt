import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type {
    DBChatId,
    DBChatMessageId,
    UIChatMessage,
} from "@/features/chat/lib/types";

import { duplicateMessages } from "./duplicate-messages";

vi.mock("../duplicate-message-metadata", () => ({
    duplicateMessageMetadata: vi.fn(metadata => metadata),
}));

vi.mock("../duplicate-message-parts", () => ({
    duplicateMessageParts: vi.fn(({ parts }) => Promise.resolve(parts)),
}));

describe("duplicateMessages", () => {
    const userId = "user-1" as any;
    const newChatId = "chat-2" as DBChatId;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should duplicate messages with new IDs", async () => {
        const uuid1 = "123e4567-e89b-12d3-a456-426614174010";
        const uuid2 = "123e4567-e89b-12d3-a456-426614174011";
        let callCount = 0;
        const uuidGenerator = vi.fn(() => {
            callCount++;
            return callCount === 1 ? uuid1 : uuid2;
        });
        vi.spyOn(global.crypto, "randomUUID").mockImplementation(uuidGenerator);

        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "Hello" }],
            } as UIChatMessage,
            {
                id: "msg-2" as DBChatMessageId,
                role: "assistant",
                parts: [{ type: "text", text: "Hi there" }],
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
        expect(result[0].role).toBe("user");
        expect(result[1].role).toBe("assistant");
    });

    it("should duplicate metadata for each message", async () => {
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                metadata: { role: "user", createdAt: new Date().toISOString() },
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
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "Hello" }],
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
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [{ type: "text", text: "Test" }],
            } as UIChatMessage,
        ];

        const result = await duplicateMessages({
            messages,
            userId,
            newChatId,
        });

        expect(result[0].role).toBe("user");
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
        const uuid1 = "123e4567-e89b-12d3-a456-426614174020";
        const uuid2 = "123e4567-e89b-12d3-a456-426614174021";
        let callCount = 0;
        const uuidGenerator = vi.fn(() => {
            callCount++;
            return callCount === 1 ? uuid1 : uuid2;
        });
        vi.spyOn(global.crypto, "randomUUID").mockImplementation(uuidGenerator);

        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [],
            } as UIChatMessage,
            {
                id: "msg-2" as DBChatMessageId,
                role: "assistant",
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
        const messages: UIChatMessage[] = [
            {
                id: "msg-1" as DBChatMessageId,
                role: "user",
                parts: [
                    { type: "text", text: "Hello" },
                    { type: "text", text: "World" },
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
            const messages: UIChatMessage[] = [
                {
                    id: "msg-1" as DBChatMessageId,
                    role: "user",
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

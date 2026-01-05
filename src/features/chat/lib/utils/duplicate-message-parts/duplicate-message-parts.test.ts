import {
    generateChatId,
    generateUserId,
} from "@/vitest/helpers/generate-test-ids";
import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIChatMessage } from "@/features/chat/lib/types";

import { duplicateMessageParts } from "./duplicate-message-parts";

vi.mock("../duplicate-message-part", () => ({
    duplicateMessagePart: vi.fn(({ part }) => Promise.resolve(part)),
}));

describe("duplicateMessageParts", () => {
    const userId = generateUserId();
    const newChatId = generateChatId();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should duplicate all parts", async () => {
        const parts = [
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" },
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "World" },
        ] as any;

        const result = await duplicateMessageParts({
            parts,
            userId,
            newChatId,
        });

        expect(result).toHaveLength(2);
    });

    it("should return empty array when parts is empty", async () => {
        const result = await duplicateMessageParts({
            parts: [],
            userId,
            newChatId,
        });

        expect(result).toEqual([]);
    });

    it("should return parts unchanged when not an array", async () => {
        const parts = null as any;

        const result = await duplicateMessageParts({
            parts,
            userId,
            newChatId,
        });

        expect(result).toBeNull();
    });

    it("should process all parts and return them", async () => {
        const parts = [
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "Part 1" },
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "Part 2" },
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "Part 3" },
        ] as any;

        const result = await duplicateMessageParts({
            parts,
            userId,
            newChatId,
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(parts[0]);
        expect(result[1]).toEqual(parts[1]);
        expect(result[2]).toEqual(parts[2]);
    });

    it("should handle mixed part types", async () => {
        const parts = [
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" },
            {
                type: CHAT_MESSAGE_TYPE.FILE,
                url: "https://example.com/file.pdf",
            },
            { type: CHAT_MESSAGE_TYPE.TEXT, text: "World" },
        ] as any;

        const result = await duplicateMessageParts({
            parts,
            userId,
            newChatId,
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual(parts[0]);
        expect(result[1]).toEqual(parts[1]);
        expect(result[2]).toEqual(parts[2]);
    });

    describe("type checking", () => {
        it("should return UIChatMessage parts array", async () => {
            const parts = [
                { type: CHAT_MESSAGE_TYPE.TEXT, text: "Hello" },
            ] as UIChatMessage["parts"];

            const result = await duplicateMessageParts({
                parts,
                userId,
                newChatId,
            });

            expectTypeOf(result).toEqualTypeOf<UIChatMessage["parts"]>();
        });
    });
});

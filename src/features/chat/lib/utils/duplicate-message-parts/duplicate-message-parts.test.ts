import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { DBChatId, UIChatMessage } from "@/features/chat/lib/types";

import { duplicateMessageParts } from "./duplicate-message-parts";

vi.mock("../duplicate-message-part", () => ({
    duplicateMessagePart: vi.fn(({ part }) => Promise.resolve(part)),
}));

describe("duplicateMessageParts", () => {
    const userId = "user-1" as any;
    const newChatId = "chat-2" as DBChatId;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should duplicate all parts", async () => {
        const parts = [
            { type: "text", text: "Hello" },
            { type: "text", text: "World" },
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
            { type: "text", text: "Part 1" },
            { type: "text", text: "Part 2" },
            { type: "text", text: "Part 3" },
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
            { type: "text", text: "Hello" },
            { type: "file", url: "https://example.com/file.pdf" },
            { type: "text", text: "World" },
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
                { type: "text", text: "Hello" },
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

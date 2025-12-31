import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_TOOL } from "@/features/chat/lib/constants";
import type { UIAssistantChatMessage } from "@/features/chat/lib/types";

import { isChatTool } from "./is-chat-tool";

describe("isChatTool", () => {
    it("should return true for getWeather tool part", () => {
        const part = {
            type: CHAT_TOOL.GET_WEATHER,
            input: { location: "New York" },
            output: { temperature: 72 },
        } as any;

        expect(isChatTool(part)).toBe(true);
    });

    it("should return true for generateImage tool part", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            input: { prompt: "A cat" },
            output: { imageUrl: "https://example.com/image.png" },
        } as any;

        expect(isChatTool(part)).toBe(true);
    });

    it("should return true for generateFile tool part", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            input: { filename: "script.js" },
            output: { fileUrl: "https://example.com/file.js" },
        } as any;

        expect(isChatTool(part)).toBe(true);
    });

    it("should return true for webSearch tool part", () => {
        const part = {
            type: CHAT_TOOL.WEB_SEARCH,
            input: { query: "test" },
            output: { results: [] },
        } as any;

        expect(isChatTool(part)).toBe(true);
    });

    it("should return false for text part", () => {
        const part = {
            type: "text",
            text: "Hello world",
        } as any;

        expect(isChatTool(part)).toBe(false);
    });

    it("should return false for file part", () => {
        const part = {
            type: "file",
            url: "https://example.com/file.pdf",
        } as any;

        expect(isChatTool(part)).toBe(false);
    });

    it("should return false for unknown tool type", () => {
        const part = {
            type: "unknown-tool",
            input: {},
            output: {},
        } as any;

        expect(isChatTool(part)).toBe(false);
    });

    describe("type narrowing", () => {
        it("should narrow type correctly when true", () => {
            const part: UIAssistantChatMessage["parts"][number] = {
                type: CHAT_TOOL.GET_WEATHER,
                input: { location: "New York" },
                output: { temperature: 72 },
            } as any;

            if (isChatTool(part)) {
                expectTypeOf(part.type).toMatchTypeOf<string>();
            }
        });

        it("should not narrow type when false", () => {
            const part: UIAssistantChatMessage["parts"][number] = {
                type: "text",
                text: "Hello world",
            } as any;

            if (!isChatTool(part)) {
                expectTypeOf(part).toMatchTypeOf<
                    UIAssistantChatMessage["parts"][number]
                >();
            }
        });
    });
});

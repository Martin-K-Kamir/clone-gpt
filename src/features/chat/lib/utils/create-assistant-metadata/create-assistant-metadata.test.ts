import type { TextStreamPart, ToolSet } from "ai";
import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_ROLE } from "@/features/chat/lib/constants";
import type { AssistantChatMessageMetadata } from "@/features/chat/lib/types";

import { createAssistantMetadata } from "./create-assistant-metadata";

describe("createAssistantMetadata", () => {
    it("should return initial metadata for start part", () => {
        const part: TextStreamPart<ToolSet> = {
            type: "start",
        } as unknown as TextStreamPart<ToolSet>;

        const model = "gpt-4o";
        const result = createAssistantMetadata({ part, model });

        expect(result).toMatchObject({
            model: "gpt-4o",
            role: CHAT_ROLE.ASSISTANT,
            isUpvoted: false,
            isDownvoted: false,
        });
        expect(result?.createdAt).toBeDefined();
        expect(typeof result?.createdAt).toBe("string");
    });

    it("should return token count for finish part", () => {
        const part = {
            type: "finish",
            finishReason: "stop" as const,
            totalUsage: {
                totalTokens: 150,
                promptTokens: 100,
                completionTokens: 50,
            },
        } as unknown as TextStreamPart<ToolSet>;

        const model = "gpt-4o";
        const result = createAssistantMetadata({ part, model });

        expect(result).toEqual({
            totalTokens: 150,
        });
    });

    it("should return undefined for other part types", () => {
        const part = {
            type: "text-delta",
            id: "test-id",
            text: "Hello",
        } as unknown as TextStreamPart<ToolSet>;

        const model = "gpt-4o";
        const result = createAssistantMetadata({ part, model });

        expect(result).toBeUndefined();
    });

    it("should use provided model name", () => {
        const part: TextStreamPart<ToolSet> = {
            type: "start",
        } as unknown as TextStreamPart<ToolSet>;

        const model = "custom-model";
        const result = createAssistantMetadata({ part, model });

        expect(result?.model).toBe("custom-model");
    });

    it("should set createdAt to ISO string", () => {
        const part: TextStreamPart<ToolSet> = {
            type: "start",
        } as unknown as TextStreamPart<ToolSet>;

        const model = "gpt-4o";
        const result = createAssistantMetadata({ part, model });

        expect(result?.createdAt).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        );
    });

    it("should handle finish part with zero tokens", () => {
        const part = {
            type: "finish",
            finishReason: "stop" as const,
            totalUsage: {
                totalTokens: 0,
                promptTokens: 0,
                completionTokens: 0,
            },
        } as unknown as TextStreamPart<ToolSet>;

        const model = "gpt-4o";
        const result = createAssistantMetadata({ part, model });

        expect(result).toEqual({
            totalTokens: 0,
        });
    });

    it("should handle finish part with large token count", () => {
        const part = {
            type: "finish",
            finishReason: "stop" as const,
            totalUsage: {
                totalTokens: 1000000,
                promptTokens: 500000,
                completionTokens: 500000,
            },
        } as unknown as TextStreamPart<ToolSet>;

        const model = "gpt-4o";
        const result = createAssistantMetadata({ part, model });

        expect(result).toEqual({
            totalTokens: 1000000,
        });
    });

    describe("type checking", () => {
        it("should return AssistantChatMessageMetadata or undefined", () => {
            const part: TextStreamPart<ToolSet> = {
                type: "start",
            } as unknown as TextStreamPart<ToolSet>;

            const model = "gpt-4o";
            const result = createAssistantMetadata({ part, model });

            expectTypeOf(result).toEqualTypeOf<
                AssistantChatMessageMetadata | undefined
            >();
        });
    });
});

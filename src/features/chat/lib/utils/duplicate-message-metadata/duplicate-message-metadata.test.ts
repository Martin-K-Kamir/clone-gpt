import { describe, expect, expectTypeOf, it } from "vitest";

import { CHAT_ROLE } from "@/features/chat/lib/constants";
import type {
    AssistantChatMessageMetadata,
    UIChatMessage,
} from "@/features/chat/lib/types";

import { duplicateMessageMetadata } from "./duplicate-message-metadata";

describe("duplicateMessageMetadata", () => {
    it("should reset assistant metadata fields", () => {
        const metadata: AssistantChatMessageMetadata = {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: new Date().toISOString(),
            model: "gpt-4o",
            totalTokens: 150,
            isUpvoted: true,
            isDownvoted: true,
        };

        const result = duplicateMessageMetadata(metadata);

        expect(result).toEqual({
            role: CHAT_ROLE.ASSISTANT,
            createdAt: metadata.createdAt,
            model: "gpt-4o",
            totalTokens: 0,
            isUpvoted: false,
            isDownvoted: false,
        });
    });

    it("should preserve other assistant metadata fields", () => {
        const metadata: AssistantChatMessageMetadata = {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: "2024-01-01T00:00:00.000Z",
            model: "custom-model",
            totalTokens: 500,
            isUpvoted: false,
            isDownvoted: true,
        };

        const result = duplicateMessageMetadata(metadata);

        if (result && "role" in result && result.role === CHAT_ROLE.ASSISTANT) {
            expect(result).toMatchObject({
                role: CHAT_ROLE.ASSISTANT,
                createdAt: "2024-01-01T00:00:00.000Z",
                model: "custom-model",
            });
            expect(result.totalTokens).toBe(0);
            expect(result.isUpvoted).toBe(false);
            expect(result.isDownvoted).toBe(false);
        }
    });

    it("should return user metadata unchanged", () => {
        const metadata = {
            role: CHAT_ROLE.USER as const,
            createdAt: new Date().toISOString(),
        };

        const result = duplicateMessageMetadata(metadata);

        expect(result).toBe(metadata);
    });

    it("should return undefined metadata unchanged", () => {
        const result = duplicateMessageMetadata(undefined);

        expect(result).toBeUndefined();
    });

    it("should return null metadata unchanged", () => {
        const result = duplicateMessageMetadata(null as any);

        expect(result).toBeNull();
    });

    it("should handle assistant metadata with zero tokens", () => {
        const metadata: AssistantChatMessageMetadata = {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: new Date().toISOString(),
            model: "gpt-4o",
            totalTokens: 0,
            isUpvoted: false,
            isDownvoted: false,
        };

        const result = duplicateMessageMetadata(metadata);

        expect(result).toEqual({
            ...metadata,
            totalTokens: 0,
            isUpvoted: false,
            isDownvoted: false,
        });
    });

    it("should handle assistant metadata with large token count", () => {
        const metadata: AssistantChatMessageMetadata = {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: new Date().toISOString(),
            model: "gpt-4o",
            totalTokens: 1000000,
            isUpvoted: true,
            isDownvoted: false,
        };

        const result = duplicateMessageMetadata(metadata);

        if (result && "role" in result && result.role === CHAT_ROLE.ASSISTANT) {
            expect(result.totalTokens).toBe(0);
            expect(result.isUpvoted).toBe(false);
            expect(result.isDownvoted).toBe(false);
        }
    });

    describe("type checking", () => {
        it("should return UIChatMessage metadata type", () => {
            const metadata: AssistantChatMessageMetadata = {
                role: CHAT_ROLE.ASSISTANT,
                createdAt: new Date().toISOString(),
                model: "gpt-4o",
                totalTokens: 150,
                isUpvoted: true,
                isDownvoted: false,
            };

            const result = duplicateMessageMetadata(metadata);

            expectTypeOf(result).toEqualTypeOf<UIChatMessage["metadata"]>();
        });
    });
});

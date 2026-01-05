import { describe, expect, expectTypeOf, it } from "vitest";

import {
    CHAT_MESSAGE_TYPE,
    CHAT_TOOL,
    STORAGE_BUCKET,
} from "@/features/chat/lib/constants";
import type { ChatMessagePart } from "@/features/chat/lib/types";

import { isGenerateImageToolPart } from "./is-generate-image-tool-part";

process.env.SUPABASE_STORAGE_URL = "https://storage.example.com";

const mockStorageUrl = "https://storage.example.com";

describe("isGenerateImageToolPart", () => {
    it("should return true for valid generate image tool part", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/image.png`,
                name: "image.png",
                id: "image-id",
            },
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(true);
    });

    it("should return false when type is not GENERATE_IMAGE", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/image.png`,
                name: "image.png",
                id: "image-id",
            },
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    it("should return false when imageUrl doesn't match prefix", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                imageUrl: "https://other-domain.com/image.png",
                name: "image.png",
                id: "image-id",
            },
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    it("should return false when imageUrl is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                name: "image.png",
                id: "image-id",
            },
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    it("should return false when name is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/image.png`,
                id: "image-id",
            },
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    it("should return false when id is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/image.png`,
                name: "image.png",
            },
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    it("should return false when output is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    it("should return false for text part", () => {
        const part = {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text: "Hello",
        } as any;

        expect(isGenerateImageToolPart(part)).toBe(false);
    });

    describe("type narrowing", () => {
        it("should narrow type correctly when true", () => {
            const part: ChatMessagePart = {
                type: CHAT_TOOL.GENERATE_IMAGE,
                output: {
                    imageUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_IMAGES}/image.png`,
                    name: "image.png",
                    id: "image-id",
                },
            } as any;

            if (isGenerateImageToolPart(part)) {
                expectTypeOf(part.type).toMatchTypeOf<string>();
                expectTypeOf(part.output).toMatchTypeOf<object>();
            }
        });

        it("should not narrow type when false", () => {
            const part: ChatMessagePart = {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "Hello",
            } as any;

            if (!isGenerateImageToolPart(part)) {
                expectTypeOf(part).toMatchTypeOf<ChatMessagePart>();
            }
        });
    });
});

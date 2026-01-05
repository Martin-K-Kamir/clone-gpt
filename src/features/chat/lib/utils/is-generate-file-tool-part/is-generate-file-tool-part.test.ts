import { describe, expect, expectTypeOf, it } from "vitest";

import {
    CHAT_MESSAGE_TYPE,
    CHAT_TOOL,
    STORAGE_BUCKET,
} from "@/features/chat/lib/constants";
import type { ChatMessagePart } from "@/features/chat/lib/types";

import { isGenerateFileToolPart } from "./is-generate-file-tool-part";

process.env.SUPABASE_STORAGE_URL = "https://storage.example.com";

const mockStorageUrl = "https://storage.example.com";

describe("isGenerateFileToolPart", () => {
    it("should return true for valid generate file tool part", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/file.js`,
                name: "file.js",
                extension: "js",
            },
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(true);
    });

    it("should return false when type is not GENERATE_FILE", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_IMAGE,
            output: {
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/file.js`,
                name: "file.js",
            },
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(false);
    });

    it("should return false when fileUrl doesn't match prefix", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                fileUrl: "https://other-domain.com/file.js",
                name: "file.js",
            },
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(false);
    });

    it("should return false when fileUrl is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                name: "file.js",
            },
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(false);
    });

    it("should return false when name is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/file.js`,
            },
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(false);
    });

    it("should return false when output is missing", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(false);
    });

    it("should return true when extension is optional", () => {
        const part = {
            type: CHAT_TOOL.GENERATE_FILE,
            output: {
                fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/file.js`,
                name: "file.js",
            },
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(true);
    });

    it("should return false for text part", () => {
        const part = {
            type: CHAT_MESSAGE_TYPE.TEXT,
            text: "Hello",
        } as any;

        expect(isGenerateFileToolPart(part)).toBe(false);
    });

    describe("type narrowing", () => {
        it("should narrow type correctly when true", () => {
            const part: ChatMessagePart = {
                type: CHAT_TOOL.GENERATE_FILE,
                output: {
                    fileUrl: `${mockStorageUrl}/${STORAGE_BUCKET.GENERATED_FILES}/file.js`,
                    name: "file.js",
                    extension: "js",
                },
            } as any;

            if (isGenerateFileToolPart(part)) {
                expectTypeOf(part.type).toMatchTypeOf<string>();
                expectTypeOf(part.output).toMatchTypeOf<object>();
            }
        });

        it("should not narrow type when false", () => {
            const part: ChatMessagePart = {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "Hello",
            } as any;

            if (!isGenerateFileToolPart(part)) {
                expectTypeOf(part).toMatchTypeOf<ChatMessagePart>();
            }
        });
    });
});

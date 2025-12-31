import { describe, expect, expectTypeOf, it } from "vitest";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { ChatMessagePart } from "@/features/chat/lib/types";

import { isUserFileMessagePart } from "./is-user-file-message-part";

process.env.SUPABASE_STORAGE_URL = "https://storage.example.com";

const mockStorageUrl = "https://storage.example.com";

describe("isUserFileMessagePart", () => {
    it("should return true for valid user file message part", () => {
        const part = {
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/document.pdf`,
            name: "document.pdf",
            extension: "pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(true);
    });

    it("should return false when url doesn't match prefix", () => {
        const part = {
            type: "file",
            url: "https://other-domain.com/document.pdf",
            name: "document.pdf",
            extension: "pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false when url is missing", () => {
        const part = {
            type: "file",
            name: "document.pdf",
            extension: "pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false when name is missing", () => {
        const part = {
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/document.pdf`,
            extension: "pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false when extension is missing", () => {
        const part = {
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/document.pdf`,
            name: "document.pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false when mediaType is missing", () => {
        const part = {
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/document.pdf`,
            name: "document.pdf",
            extension: "pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false when url is not a valid URL", () => {
        const part = {
            type: "file",
            url: "not-a-url",
            name: "document.pdf",
            extension: "pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false for text part", () => {
        const part = {
            type: "text",
            text: "Hello",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    it("should return false when name is empty string", () => {
        const part = {
            type: "file",
            url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/document.pdf`,
            name: "",
            extension: "pdf",
            mediaType: "application/pdf",
        } as any;

        expect(isUserFileMessagePart(part)).toBe(false);
    });

    describe("type narrowing", () => {
        it("should narrow type correctly when true", () => {
            const part: ChatMessagePart = {
                type: "file",
                url: `${mockStorageUrl}/${STORAGE_BUCKET.USER_FILES}/document.pdf`,
                name: "document.pdf",
                extension: "pdf",
                mediaType: "application/pdf",
            } as any;

            if (isUserFileMessagePart(part)) {
                expectTypeOf(part).toMatchTypeOf<ChatMessagePart>();
            }
        });

        it("should not narrow type when false", () => {
            const part: ChatMessagePart = {
                type: "text",
                text: "Hello",
            } as any;

            if (!isUserFileMessagePart(part)) {
                expectTypeOf(part).toMatchTypeOf<ChatMessagePart>();
            }
        });
    });
});

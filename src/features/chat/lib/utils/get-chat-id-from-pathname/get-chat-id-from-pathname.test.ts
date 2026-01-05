import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { describe, expect, it } from "vitest";

import { getChatIdFromPathname } from "./get-chat-id-from-pathname";

describe("getChatIdFromPathname", () => {
    it("should extract valid UUID from pathname", () => {
        const chatId = generateChatId();
        const pathname = `/chat/${chatId}`;
        const result = getChatIdFromPathname(pathname);

        expect(result).toBe(chatId);
    });

    it("should extract UUID case-insensitively", () => {
        const chatId = generateChatId();
        const pathname = `/chat/${chatId.toUpperCase()}`;
        const result = getChatIdFromPathname(pathname);

        expect(result).toBe(chatId.toUpperCase());
    });

    it("should return null when pathname doesn't match pattern", () => {
        const pathname = "/chat/invalid-id";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when pathname doesn't end with chat ID", () => {
        const chatId = generateChatId();
        const pathname = `/chat/${chatId}/extra`;
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when pathname doesn't start with /chat/", () => {
        const chatId = generateChatId();
        const pathname = `/other/${chatId}`;
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when UUID format is invalid", () => {
        const pathname = "/chat/123e4567-e89b-12d3-a456";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null for empty pathname", () => {
        const pathname = "";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when pathname is just /chat", () => {
        const pathname = "/chat";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when pathname is /chat/", () => {
        const pathname = "/chat/";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });
});

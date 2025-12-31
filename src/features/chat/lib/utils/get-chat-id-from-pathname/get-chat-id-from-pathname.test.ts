import { describe, expect, it } from "vitest";

import { getChatIdFromPathname } from "./get-chat-id-from-pathname";

describe("getChatIdFromPathname", () => {
    it("should extract valid UUID from pathname", () => {
        const pathname = "/chat/123e4567-e89b-12d3-a456-426614174000";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBe("123e4567-e89b-12d3-a456-426614174000");
    });

    it("should extract UUID case-insensitively", () => {
        const pathname = "/chat/123E4567-E89B-12D3-A456-426614174000";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBe("123E4567-E89B-12D3-A456-426614174000");
    });

    it("should return null when pathname doesn't match pattern", () => {
        const pathname = "/chat/invalid-id";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when pathname doesn't end with chat ID", () => {
        const pathname = "/chat/123e4567-e89b-12d3-a456-426614174000/extra";
        const result = getChatIdFromPathname(pathname);

        expect(result).toBeNull();
    });

    it("should return null when pathname doesn't start with /chat/", () => {
        const pathname = "/other/123e4567-e89b-12d3-a456-426614174000";
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

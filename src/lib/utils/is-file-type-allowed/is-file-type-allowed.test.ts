import { describe, expect, it } from "vitest";

import { isFileTypeAllowed } from "./is-file-type-allowed";

function createFile(name: string, type: string): File {
    return new File([], name, { type });
}

describe("isFileTypeAllowed", () => {
    it("should return true for exact MIME type match", () => {
        const file = createFile("test.pdf", "application/pdf");
        expect(isFileTypeAllowed(file, ["application/pdf"])).toBe(true);
    });

    it("should return false when MIME type does not match", () => {
        const file = createFile("test.pdf", "application/pdf");
        expect(isFileTypeAllowed(file, ["image/png"])).toBe(false);
    });

    it("should return true for wildcard MIME type", () => {
        const file = createFile("test.png", "image/png");
        expect(isFileTypeAllowed(file, ["image/*"])).toBe(true);
    });

    it("should return true for any image type with image/*", () => {
        const file = createFile("test.jpg", "image/jpeg");
        expect(isFileTypeAllowed(file, ["image/*"])).toBe(true);
    });

    it("should return true for file extension match", () => {
        const file = createFile("test.pdf", "application/pdf");
        expect(isFileTypeAllowed(file, [".pdf"])).toBe(true);
    });

    it("should return true for case-insensitive extension match", () => {
        const file = createFile("test.PDF", "application/pdf");
        expect(isFileTypeAllowed(file, [".pdf"])).toBe(true);
    });

    it("should return false when extension does not match", () => {
        const file = createFile("test.pdf", "application/pdf");
        expect(isFileTypeAllowed(file, [".png"])).toBe(false);
    });

    it("should return true if any accepted type matches", () => {
        const file = createFile("test.png", "image/png");
        expect(
            isFileTypeAllowed(file, ["image/png", "image/jpeg", ".pdf"]),
        ).toBe(true);
    });

    it("should return false if no accepted types match", () => {
        const file = createFile("test.png", "image/png");
        expect(
            isFileTypeAllowed(file, ["image/jpeg", ".pdf", "text/plain"]),
        ).toBe(false);
    });

    it("should handle empty accepted types array", () => {
        const file = createFile("test.png", "image/png");
        expect(isFileTypeAllowed(file, [])).toBe(false);
    });

    it("should handle file without name", () => {
        const file = new File([], "", { type: "image/png" });
        expect(isFileTypeAllowed(file, [".png"])).toBe(false);
        expect(isFileTypeAllowed(file, ["image/png"])).toBe(true);
    });

    it("should handle file without type", () => {
        const file = new File([], "test.pdf", { type: "" });
        expect(isFileTypeAllowed(file, ["application/pdf"])).toBe(false);
        expect(isFileTypeAllowed(file, [".pdf"])).toBe(true);
    });

    it("should handle multiple wildcard types", () => {
        const file = createFile("test.png", "image/png");
        expect(isFileTypeAllowed(file, ["image/*", "video/*"])).toBe(true);
    });

    it("should handle mixed MIME types and extensions", () => {
        const file = createFile("test.pdf", "application/pdf");
        expect(
            isFileTypeAllowed(file, ["image/png", ".pdf", "text/plain"]),
        ).toBe(true);
    });

    it("should not match partial extension", () => {
        const file = createFile("test.pdfx", "application/pdf");
        expect(isFileTypeAllowed(file, [".pdf"])).toBe(false);
    });

    it("should handle wildcard at end of MIME type", () => {
        const file = createFile("test.json", "application/json");
        expect(isFileTypeAllowed(file, ["application/*"])).toBe(true);
    });
});

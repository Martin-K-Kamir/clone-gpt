import { describe, expect, it } from "vitest";

import { parseStorageFileUrl } from "./parse-storage-file-url";

describe("parseStorageFileUrl", () => {
    it("should return null for undefined", () => {
        expect(parseStorageFileUrl(undefined)).toBeNull();
    });

    it("should return null for empty string", () => {
        expect(parseStorageFileUrl("")).toBeNull();
    });

    it("should parse URL with filename and extension", () => {
        const result = parseStorageFileUrl("https://example.com/path/file.jpg");
        expect(result).toEqual({
            filename: "file",
            extension: "jpg",
        });
    });

    it("should parse URL without extension", () => {
        const result = parseStorageFileUrl("https://example.com/path/file");
        expect(result).toEqual({
            filename: "file",
            extension: "",
        });
    });

    it("should remove UUID from filename", () => {
        const result = parseStorageFileUrl(
            "https://example.com/path/file-12345678-1234-1234-1234-123456789abc.jpg",
        );
        expect(result).toEqual({
            filename: "file",
            extension: "jpg",
        });
    });

    it("should handle multiple dots in filename", () => {
        const result = parseStorageFileUrl(
            "https://example.com/path/file.name.jpg",
        );
        expect(result).toEqual({
            filename: "file.name",
            extension: "jpg",
        });
    });

    it("should handle URL ending with slash", () => {
        const result = parseStorageFileUrl("https://example.com/path/");
        expect(result).toBeNull();
    });

    it("should handle complex path", () => {
        const result = parseStorageFileUrl(
            "https://example.com/storage/bucket/folder/subfolder/image.png",
        );
        expect(result).toEqual({
            filename: "image",
            extension: "png",
        });
    });

    it("should handle uppercase UUID", () => {
        const result = parseStorageFileUrl(
            "https://example.com/path/file-ABCDEF12-ABCD-ABCD-ABCD-ABCDEF123456.jpg",
        );
        expect(result).toEqual({
            filename: "file",
            extension: "jpg",
        });
    });

    it("should return null for invalid URL format", () => {
        const result = parseStorageFileUrl("not-a-url");
        expect(result).toEqual({
            filename: "not-a-url",
            extension: "",
        });
    });
});

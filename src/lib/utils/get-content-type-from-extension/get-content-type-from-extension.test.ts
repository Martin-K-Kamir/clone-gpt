import { describe, expect, it } from "vitest";

import { getContentTypeFromExtension } from "./get-content-type-from-extension";

describe("getContentTypeFromExtension", () => {
    it("should return null for empty string", () => {
        expect(getContentTypeFromExtension("")).toBeNull();
    });

    it("should return null for invalid extension", () => {
        expect(getContentTypeFromExtension("invalid")).toBeNull();
        expect(getContentTypeFromExtension(".xyz")).toBeNull();
    });

    it("should handle extension with dot", () => {
        expect(getContentTypeFromExtension(".js")).toBe("text/javascript");
        expect(getContentTypeFromExtension(".png")).toBe("image/png");
        expect(getContentTypeFromExtension(".pdf")).toBe("application/pdf");
    });

    it("should handle extension without dot", () => {
        expect(getContentTypeFromExtension("js")).toBe("text/javascript");
        expect(getContentTypeFromExtension("png")).toBe("image/png");
        expect(getContentTypeFromExtension("pdf")).toBe("application/pdf");
    });

    it("should be case-insensitive", () => {
        expect(getContentTypeFromExtension("JS")).toBe("text/javascript");
        expect(getContentTypeFromExtension("Js")).toBe("text/javascript");
        expect(getContentTypeFromExtension("jS")).toBe("text/javascript");
        expect(getContentTypeFromExtension(".JS")).toBe("text/javascript");
        expect(getContentTypeFromExtension(".Js")).toBe("text/javascript");
    });

    it("should return correct MIME type for code extensions", () => {
        expect(getContentTypeFromExtension("ts")).toBe("text/typescript");
        expect(getContentTypeFromExtension("tsx")).toBe("text/typescript");
        expect(getContentTypeFromExtension("py")).toBe("text/x-python");
        expect(getContentTypeFromExtension("java")).toBe("text/x-java-source");
        expect(getContentTypeFromExtension("html")).toBe("text/html");
        expect(getContentTypeFromExtension("css")).toBe("text/css");
    });

    it("should return correct MIME type for image extensions", () => {
        expect(getContentTypeFromExtension("jpeg")).toBe("image/jpeg");
        expect(getContentTypeFromExtension("gif")).toBe("image/gif");
        expect(getContentTypeFromExtension("svg")).toBe("image/svg+xml");
        expect(getContentTypeFromExtension("webp")).toBe("image/webp");
    });

    it("should return correct MIME type for document extensions", () => {
        expect(getContentTypeFromExtension("doc")).toBe("application/msword");
        expect(getContentTypeFromExtension("docx")).toBe(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        expect(getContentTypeFromExtension("xls")).toBe(
            "application/vnd.ms-excel",
        );
        expect(getContentTypeFromExtension("xlsx")).toBe(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
    });

    it("should return correct MIME type for archive extensions", () => {
        expect(getContentTypeFromExtension("zip")).toBe("application/zip");
        expect(getContentTypeFromExtension("tar")).toBe("application/x-tar");
        expect(getContentTypeFromExtension("rar")).toBe(
            "application/x-rar-compressed",
        );
    });

    it("should return correct MIME type for audio extensions", () => {
        expect(getContentTypeFromExtension("mp3")).toBe("audio/mpeg");
        expect(getContentTypeFromExtension("wav")).toBe("audio/wav");
        expect(getContentTypeFromExtension("ogg")).toBe("video/ogg");
    });

    it("should return correct MIME type for video extensions", () => {
        expect(getContentTypeFromExtension("mp4")).toBe("video/mp4");
        expect(getContentTypeFromExtension("webm")).toBe("video/webm");
        expect(getContentTypeFromExtension("mkv")).toBe("video/x-matroska");
    });

    it("should return correct MIME type for text extensions", () => {
        expect(getContentTypeFromExtension("txt")).toBe("text/plain");
        expect(getContentTypeFromExtension("md")).toBe("text/markdown");
        expect(getContentTypeFromExtension("json")).toBe("application/json");
        expect(getContentTypeFromExtension("csv")).toBe("text/csv");
    });

    it("should handle extensions with multiple dots", () => {
        expect(getContentTypeFromExtension(".json")).toBe("application/json");
    });

    it("should handle edge case extensions", () => {
        expect(getContentTypeFromExtension("htm")).toBe("text/html");
        expect(getContentTypeFromExtension("yml")).toBe("text/yaml");
        expect(getContentTypeFromExtension("yaml")).toBe("text/yaml");
    });

    it("should return null for extension that exists in FILE_EXTENSION but not in MIME_TYPE", () => {
        expect(getContentTypeFromExtension("nonexistent123")).toBeNull();
    });
});

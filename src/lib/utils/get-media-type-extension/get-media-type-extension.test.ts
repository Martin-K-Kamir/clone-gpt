import { describe, expect, it } from "vitest";

import { getMediaTypeExtension } from "./get-media-type-extension";

describe("getMediaTypeExtension", () => {
    it("should extract extension from image media types", () => {
        expect(getMediaTypeExtension("image/png")).toBe("png");
        expect(getMediaTypeExtension("image/jpeg")).toBe("jpeg");
        expect(getMediaTypeExtension("image/gif")).toBe("gif");
        expect(getMediaTypeExtension("image/svg+xml")).toBe("svg+xml");
    });

    it("should extract extension from video media types", () => {
        expect(getMediaTypeExtension("video/mp4")).toBe("mp4");
        expect(getMediaTypeExtension("video/webm")).toBe("webm");
        expect(getMediaTypeExtension("video/quicktime")).toBe("quicktime");
    });

    it("should extract extension from audio media types", () => {
        expect(getMediaTypeExtension("audio/mpeg")).toBe("mpeg");
        expect(getMediaTypeExtension("audio/wav")).toBe("wav");
        expect(getMediaTypeExtension("audio/ogg")).toBe("ogg");
    });

    it("should extract extension from application media types", () => {
        expect(getMediaTypeExtension("application/pdf")).toBe("pdf");
        expect(getMediaTypeExtension("application/json")).toBe("json");
        expect(getMediaTypeExtension("application/zip")).toBe("zip");
    });

    it("should extract extension from text media types", () => {
        expect(getMediaTypeExtension("text/plain")).toBe("plain");
        expect(getMediaTypeExtension("text/html")).toBe("html");
        expect(getMediaTypeExtension("text/css")).toBe("css");
        expect(getMediaTypeExtension("text/javascript")).toBe("javascript");
    });

    it("should extract extension with plus sign", () => {
        expect(getMediaTypeExtension("image/svg+xml")).toBe("svg+xml");
        expect(getMediaTypeExtension("application/vnd.api+json")).toBe(
            "vnd.api+json",
        );
    });

    it("should extract extension with dots", () => {
        expect(getMediaTypeExtension("application/vnd.ms-excel")).toBe(
            "vnd.ms-excel",
        );
        expect(getMediaTypeExtension("application/x-www-form-urlencoded")).toBe(
            "x-www-form-urlencoded",
        );
    });

    it("should throw error for invalid format without slash", () => {
        expect(() => getMediaTypeExtension("invalid")).toThrow(
            "Invalid media type format: invalid",
        );
    });

    it("should throw error for empty string", () => {
        expect(() => getMediaTypeExtension("")).toThrow(
            "Invalid media type format: ",
        );
    });

    it("should throw error for format with only slash", () => {
        expect(() => getMediaTypeExtension("/")).toThrow(
            "Invalid media type format: /",
        );
    });

    it("should throw error for format ending with slash", () => {
        expect(() => getMediaTypeExtension("image/")).toThrow(
            "Invalid media type format: image/",
        );
    });

    it("should extract extension from complex media types", () => {
        expect(
            getMediaTypeExtension(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ),
        ).toBe("vnd.openxmlformats-officedocument.wordprocessingml.document");
    });

    it("should handle single character extensions", () => {
        expect(getMediaTypeExtension("text/c")).toBe("c");
    });
});

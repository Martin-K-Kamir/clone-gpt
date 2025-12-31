import { describe, expect, it } from "vitest";

import { getFileGenerationHandler } from "./get-file-generation-handler";

describe("getFileGenerationHandler", () => {
    it("should return error when file has no extension", () => {
        const result = getFileGenerationHandler("filename");

        expect(result.supported).toBe(false);
        if (!result.supported) {
            expect(result.reason).toContain("is not supported");
        }
    });

    it("should return error when file has empty extension", () => {
        const result = getFileGenerationHandler("filename.");

        expect(result.supported).toBe(false);
        if (!result.supported) {
            expect(result.reason).toBe("File must have an extension");
        }
    });

    it("should return generateCode handler for code file extensions", () => {
        const result = getFileGenerationHandler("script.js");

        expect(result).toEqual({
            supported: true,
            handler: "generateCode",
        });
    });

    it("should return interpretCode handler for non-code file extensions", () => {
        const result = getFileGenerationHandler("document.pdf");

        expect(result).toEqual({
            supported: true,
            handler: "interpretCode",
        });
    });

    it("should return error with suggestion for image files", () => {
        const result = getFileGenerationHandler("image.png");

        expect(result).toEqual({
            supported: false,
            reason: expect.stringContaining("Image files"),
            suggestion:
                "Use the generateImage tool instead for image generation",
        });
    });

    it("should return error with suggestion for video files", () => {
        const result = getFileGenerationHandler("video.mp4");

        expect(result).toEqual({
            supported: false,
            reason: expect.stringContaining("Video files"),
            suggestion: "Video generation is not currently available",
        });
    });

    it("should return error with suggestion for unsupported file types", () => {
        const result = getFileGenerationHandler("file.xyz");

        expect(result).toEqual({
            supported: false,
            reason: expect.stringContaining("is not supported"),
            suggestion: expect.stringContaining("Supported extensions"),
        });
    });

    it("should handle uppercase extensions", () => {
        const result = getFileGenerationHandler("script.JS");

        expect(result).toEqual({
            supported: true,
            handler: "generateCode",
        });
    });

    it("should handle mixed case extensions", () => {
        const result = getFileGenerationHandler("document.PDF");

        expect(result).toEqual({
            supported: true,
            handler: "interpretCode",
        });
    });

    it("should handle files with multiple dots", () => {
        const result = getFileGenerationHandler("file.name.js");

        expect(result).toEqual({
            supported: true,
            handler: "generateCode",
        });
    });

    it("should handle files with path separators", () => {
        const result = getFileGenerationHandler("path/to/file.js");

        expect(result).toEqual({
            supported: true,
            handler: "generateCode",
        });
    });
});

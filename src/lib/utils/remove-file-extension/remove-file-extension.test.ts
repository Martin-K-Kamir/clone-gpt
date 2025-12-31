import { describe, expect, it } from "vitest";

import { removeFileExtension } from "./remove-file-extension";

describe("removeFileExtension", () => {
    it("should remove extension from string filename", () => {
        expect(removeFileExtension("file.txt")).toBe("file");
    });

    it("should handle multiple dots", () => {
        expect(removeFileExtension("file.name.txt")).toBe("file.name");
    });

    it("should handle filename without extension", () => {
        expect(removeFileExtension("file")).toBe("file");
    });

    it("should handle File object", () => {
        const file = new File([], "document.pdf", { type: "application/pdf" });
        expect(removeFileExtension(file)).toBe("document");
    });

    it("should handle File object without extension", () => {
        const file = new File([], "document", { type: "text/plain" });
        expect(removeFileExtension(file)).toBe("document");
    });

    it("should handle File object with multiple dots", () => {
        const file = new File([], "file.name.pdf", { type: "application/pdf" });
        expect(removeFileExtension(file)).toBe("file.name");
    });

    it("should handle long extension", () => {
        expect(removeFileExtension("file.tar.gz")).toBe("file.tar");
    });

    it("should handle path with extension", () => {
        expect(removeFileExtension("/path/to/file.txt")).toBe("/path/to/file");
    });

    it("should handle empty string", () => {
        expect(removeFileExtension("")).toBe("");
    });
});

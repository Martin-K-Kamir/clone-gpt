import { describe, expect, it } from "vitest";

import { getFileExtension } from "./get-file-extension";

describe("getFileExtension", () => {
    describe("with string input", () => {
        it("should extract extension from filename", () => {
            expect(getFileExtension("file.txt")).toBe("txt");
            expect(getFileExtension("document.pdf")).toBe("pdf");
            expect(getFileExtension("image.png")).toBe("png");
        });

        it("should return filename when no extension", () => {
            expect(getFileExtension("file")).toBe("file");
            expect(getFileExtension("noextension")).toBe("noextension");
        });

        it("should handle files with multiple dots", () => {
            expect(getFileExtension("file.backup.txt")).toBe("txt");
            expect(getFileExtension("archive.tar.gz")).toBe("gz");
            expect(getFileExtension("config.min.js")).toBe("js");
        });

        it("should handle files starting with dot", () => {
            expect(getFileExtension(".hidden")).toBe("hidden");
            expect(getFileExtension(".env")).toBe("env");
        });

        it("should handle files with only extension", () => {
            expect(getFileExtension(".txt")).toBe("txt");
        });

        it("should handle empty string", () => {
            expect(getFileExtension("")).toBe("");
        });

        it("should handle path with extension", () => {
            expect(getFileExtension("/path/to/file.txt")).toBe("txt");
            expect(getFileExtension("C:\\path\\to\\file.txt")).toBe("txt");
        });

        it("should handle path without extension", () => {
            expect(getFileExtension("/path/to/file")).toBe("/path/to/file");
        });
    });

    describe("with File object input", () => {
        it("should extract extension from File.name", () => {
            const file = new File(["content"], "document.pdf", {
                type: "application/pdf",
            });
            expect(getFileExtension(file)).toBe("pdf");
        });

        it("should return filename for File without extension", () => {
            const file = new File(["content"], "file", {
                type: "text/plain",
            });
            expect(getFileExtension(file)).toBe("file");
        });

        it("should handle File with multiple dots in name", () => {
            const file = new File(["content"], "file.backup.txt", {
                type: "text/plain",
            });
            expect(getFileExtension(file)).toBe("txt");
        });

        it("should handle File starting with dot", () => {
            const file = new File(["content"], ".hidden", {
                type: "text/plain",
            });
            expect(getFileExtension(file)).toBe("hidden");
        });

        it("should handle File with only extension", () => {
            const file = new File(["content"], ".txt", {
                type: "text/plain",
            });
            expect(getFileExtension(file)).toBe("txt");
        });

        it("should handle File with path-like name", () => {
            const file = new File(["content"], "path/to/file.js", {
                type: "text/javascript",
            });
            expect(getFileExtension(file)).toBe("js");
        });
    });

    describe("edge cases", () => {
        it("should handle very long filenames", () => {
            const longName = "a".repeat(100) + ".txt";
            expect(getFileExtension(longName)).toBe("txt");
        });

        it("should handle special characters in filename", () => {
            expect(getFileExtension("file-name_123.txt")).toBe("txt");
            expect(getFileExtension("file@name#123.txt")).toBe("txt");
        });

        it("should handle unicode characters", () => {
            expect(getFileExtension("файл.txt")).toBe("txt");
            expect(getFileExtension("文件.pdf")).toBe("pdf");
        });

        it("should handle extension with numbers", () => {
            expect(getFileExtension("file.7z")).toBe("7z");
            expect(getFileExtension("file.mp3")).toBe("mp3");
        });
    });
});

/**
 * @vitest-environment jsdom
 */
import { fileTypeFromBuffer } from "file-type";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { validateFileContent } from "./validate-file-content";

vi.mock("file-type", () => ({
    fileTypeFromBuffer: vi.fn(),
}));

function createFile(name: string, type: string, content: Uint8Array): File {
    const file = new File([content.buffer as ArrayBuffer], name, { type });
    file.arrayBuffer = vi.fn().mockResolvedValue(content.buffer as ArrayBuffer);
    return file;
}

describe("validateFileContent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return valid when types match and file is accepted", async () => {
        const file = createFile(
            "test.pdf",
            "application/pdf",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockResolvedValue({
            mime: "application/pdf",
        } as any);

        const result = await validateFileContent(file, ["application/pdf"]);

        expect(result.isValid).toBe(true);
        expect(result.claimedType).toBe("application/pdf");
        expect(result.actualType).toBe("application/pdf");
    });

    it("should return invalid when file type is not accepted", async () => {
        const file = createFile(
            "test.pdf",
            "application/pdf",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockResolvedValue({
            mime: "application/pdf",
        } as any);

        const result = await validateFileContent(file, ["image/png"]);

        expect(result.isValid).toBe(false);
        expect(result.claimedType).toBe("application/pdf");
        expect(result.actualType).toBe("application/pdf");
    });

    it("should return invalid when claimed and actual types don't match", async () => {
        const file = createFile(
            "test.pdf",
            "application/pdf",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockResolvedValue({
            mime: "image/png",
        } as any);

        const result = await validateFileContent(file, [
            "application/pdf",
            "image/png",
        ]);

        expect(result.isValid).toBe(false);
        expect(result.claimedType).toBe("application/pdf");
        expect(result.actualType).toBe("image/png");
    });

    it("should return valid when actualFileType is null but file is accepted", async () => {
        const file = createFile(
            "test.txt",
            "text/plain",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockResolvedValue(null as any);

        const result = await validateFileContent(file, ["text/plain"]);

        expect(result.isValid).toBe(true);
        expect(result.claimedType).toBe("text/plain");
        expect(result.actualType).toBeUndefined();
    });

    it("should return invalid when error occurs", async () => {
        const file = createFile(
            "test.pdf",
            "application/pdf",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockRejectedValue(new Error("Failed"));

        const result = await validateFileContent(file, ["application/pdf"]);

        expect(result.isValid).toBe(false);
        expect(result.claimedType).toBe("application/pdf");
        expect(result.actualType).toBeUndefined();
    });

    it("should handle wildcard accepted types", async () => {
        const file = createFile(
            "test.png",
            "image/png",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockResolvedValue({
            mime: "image/png",
        } as any);

        const result = await validateFileContent(file, ["image/*"]);

        expect(result.isValid).toBe(true);
        expect(result.actualType).toBe("image/png");
    });

    it("should handle file extension accepted types", async () => {
        const file = createFile(
            "test.pdf",
            "application/pdf",
            new Uint8Array([1, 2, 3]),
        );
        vi.mocked(fileTypeFromBuffer).mockResolvedValue({
            mime: "application/pdf",
        } as any);

        const result = await validateFileContent(file, [".pdf"]);

        expect(result.isValid).toBe(true);
    });
});

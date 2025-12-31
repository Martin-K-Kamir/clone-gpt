/*
 * @jest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadFile } from "./download-file";

describe("downloadFile", () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockLink: {
        download: string | undefined;
        href: string;
        style: { visibility: string };
        setAttribute: ReturnType<typeof vi.fn>;
        click: ReturnType<typeof vi.fn>;
    };
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockBody: {
        appendChild: ReturnType<typeof vi.fn>;
        removeChild: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        mockCreateObjectURL = vi.fn(() => "blob:mock-url");
        mockRevokeObjectURL = vi.fn();
        mockLink = {
            download: "",
            href: "",
            style: { visibility: "" },
            setAttribute: vi.fn(),
            click: vi.fn(),
        };
        mockAppendChild = vi.fn();
        mockRemoveChild = vi.fn();
        mockBody = {
            appendChild: mockAppendChild,
            removeChild: mockRemoveChild,
        };

        global.URL = {
            createObjectURL: mockCreateObjectURL,
            revokeObjectURL: mockRevokeObjectURL,
        } as any;
        global.document = {
            createElement: vi.fn(() => mockLink),
            body: mockBody,
        } as any;
    });

    it("should download file with string data", () => {
        const result = downloadFile("test content", "test.txt", "text/plain");

        expect(result).toBe(true);
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
            "href",
            "blob:mock-url",
        );
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
            "download",
            "test.txt",
        );
        expect(mockLink.style.visibility).toBe("hidden");
        expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should download file with ArrayBuffer data", () => {
        const buffer = new ArrayBuffer(8);
        const result = downloadFile(
            buffer,
            "data.bin",
            "application/octet-stream",
        );

        expect(result).toBe(true);
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
            "download",
            "data.bin",
        );
    });

    it("should use correct MIME type", () => {
        downloadFile("content", "file.pdf", "application/pdf");

        const blobCall = mockCreateObjectURL.mock.calls[0][0];
        expect(blobCall).toBeInstanceOf(Blob);
        expect(blobCall.type).toBe("application/pdf");
    });

    it("should return false when download is not supported", () => {
        mockLink.download = undefined;

        const result = downloadFile("content", "file.txt", "text/plain");

        expect(result).toBe(false);
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
    });

    it("should return false and log error when blob creation fails", () => {
        mockCreateObjectURL.mockImplementation(() => {
            throw new Error("Blob creation failed");
        });

        const result = downloadFile("content", "file.txt", "text/plain");

        expect(result).toBe(false);
    });

    it("should return false and log error when link operations fail", () => {
        mockLink.click.mockImplementation(() => {
            throw new Error("Click failed");
        });

        const result = downloadFile("content", "file.txt", "text/plain");

        expect(result).toBe(false);
    });

    it("should handle different file types", () => {
        const testCases = [
            { mimeType: "text/plain", filename: "file.txt" },
            { mimeType: "application/json", filename: "data.json" },
            { mimeType: "image/png", filename: "image.png" },
            { mimeType: "application/pdf", filename: "document.pdf" },
        ];

        testCases.forEach(({ mimeType, filename }) => {
            const result = downloadFile("content", filename, mimeType);

            expect(result).toBe(true);
            const blobCall =
                mockCreateObjectURL.mock.calls[
                    mockCreateObjectURL.mock.calls.length - 1
                ][0];
            expect(blobCall.type).toBe(mimeType);
        });
    });

    it("should handle special characters in filename", () => {
        const result = downloadFile(
            "content",
            "file with spaces & special chars.txt",
            "text/plain",
        );

        expect(result).toBe(true);
        expect(mockLink.setAttribute).toHaveBeenCalledWith(
            "download",
            "file with spaces & special chars.txt",
        );
    });

    it("should clean up object URL after download", () => {
        downloadFile("content", "file.txt", "text/plain");

        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
        expect(mockRevokeObjectURL).toHaveBeenCalledAfter(
            mockLink.click as any,
        );
    });

    it("should remove link from DOM after clicking", () => {
        downloadFile("content", "file.txt", "text/plain");

        expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
        expect(mockRemoveChild).toHaveBeenCalledAfter(mockLink.click as any);
    });

    it("should handle empty string data", () => {
        const result = downloadFile("", "empty.txt", "text/plain");

        expect(result).toBe(true);
        expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    it("should handle empty filename", () => {
        const result = downloadFile("content", "", "text/plain");

        expect(result).toBe(true);
        expect(mockLink.setAttribute).toHaveBeenCalledWith("download", "");
    });
});

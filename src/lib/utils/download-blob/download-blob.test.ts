import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadBlob } from "./download-blob";

describe("downloadBlob", () => {
    let mockFetch: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockOpen: ReturnType<typeof vi.fn>;
    let mockLink: {
        href: string;
        download: string;
        click: ReturnType<typeof vi.fn>;
    };
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockBody: {
        appendChild: ReturnType<typeof vi.fn>;
        removeChild: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        mockFetch = vi.fn();
        mockCreateObjectURL = vi.fn(() => "blob:mock-url");
        mockRevokeObjectURL = vi.fn();
        mockOpen = vi.fn();
        mockLink = {
            href: "",
            download: "",
            click: vi.fn(),
        };
        mockAppendChild = vi.fn();
        mockRemoveChild = vi.fn();
        mockBody = {
            appendChild: mockAppendChild,
            removeChild: mockRemoveChild,
        };

        global.fetch = mockFetch as any;
        global.window = {
            URL: {
                createObjectURL: mockCreateObjectURL,
                revokeObjectURL: mockRevokeObjectURL,
            },
            open: mockOpen,
        } as any;
        global.document = {
            createElement: vi.fn(() => mockLink),
            body: mockBody,
        } as any;
    });

    it("should download blob with custom name", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "https://example.com/file.txt",
            name: "custom-name.txt",
        });

        expect(mockFetch).toHaveBeenCalledWith("https://example.com/file.txt");
        expect(mockResponse.blob).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
        expect(mockLink.href).toBe("blob:mock-url");
        expect(mockLink.download).toBe("custom-name.txt");
        expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should use src as name when name is not provided", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({ src: "https://example.com/file.txt" });

        expect(mockLink.download).toBe("https://example.com/file.txt");
    });

    it("should handle different blob types", async () => {
        const mockBlob = new Blob(["image data"], { type: "image/png" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "https://example.com/image.png",
            name: "image.png",
        });

        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it("should open URL in new tab when fetch fails", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"));

        await downloadBlob({
            src: "https://example.com/file.txt",
            name: "file.txt",
        });

        expect(mockOpen).toHaveBeenCalledWith(
            "https://example.com/file.txt",
            "_blank",
        );
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
        expect(mockLink.click).not.toHaveBeenCalled();
    });

    it("should open URL in new tab when blob creation fails", async () => {
        const mockResponse = {
            blob: vi.fn().mockRejectedValue(new Error("Blob error")),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "https://example.com/file.txt",
            name: "file.txt",
        });

        expect(mockOpen).toHaveBeenCalledWith(
            "https://example.com/file.txt",
            "_blank",
        );
        expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it("should handle relative URLs", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "/api/files/document.pdf",
            name: "document.pdf",
        });

        expect(mockFetch).toHaveBeenCalledWith("/api/files/document.pdf");
    });

    it("should clean up object URL after download", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "https://example.com/file.txt",
            name: "file.txt",
        });

        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
        expect(mockRevokeObjectURL).toHaveBeenCalledAfter(
            mockLink.click as any,
        );
    });

    it("should remove link from DOM after clicking", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "https://example.com/file.txt",
            name: "file.txt",
        });

        expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
        expect(mockRemoveChild).toHaveBeenCalledAfter(mockLink.click as any);
    });

    it("should handle empty name", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({ src: "https://example.com/file.txt", name: "" });

        expect(mockLink.download).toBe("");
    });

    it("should handle special characters in filename", async () => {
        const mockBlob = new Blob(["test content"], { type: "text/plain" });
        const mockResponse = {
            blob: vi.fn().mockResolvedValue(mockBlob),
        };
        mockFetch.mockResolvedValue(mockResponse);

        await downloadBlob({
            src: "https://example.com/file.txt",
            name: "file with spaces & special chars.txt",
        });

        expect(mockLink.download).toBe("file with spaces & special chars.txt");
    });
});

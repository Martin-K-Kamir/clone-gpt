import { describe, expect, it } from "vitest";

import { getFileImageDimensions } from "./get-file-image-dimensions";

function createFileWithBuffer(
    buffer: Buffer,
    name: string,
    type: string,
): File {
    const uint8Array = new Uint8Array(buffer);
    const file = new File([uint8Array], name, { type });

    file.arrayBuffer = async (): Promise<ArrayBuffer> => {
        return buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
        ) as ArrayBuffer;
    };

    return file;
}

function createPNGBuffer(width: number, height: number): Buffer {
    const buffer = Buffer.alloc(24);
    buffer.writeUInt32BE(0x89504e47, 0);
    buffer.writeUInt32BE(0x0d0a1a0a, 4);
    buffer.writeUInt32BE(0x0000000d, 8);
    buffer.write("IHDR", 12, 4, "ascii");
    buffer.writeUInt32BE(width, 16);
    buffer.writeUInt32BE(height, 20);
    return buffer;
}

function createJPEGBuffer(width: number, height: number): Buffer {
    const buffer = Buffer.alloc(20);
    buffer[0] = 0xff;
    buffer[1] = 0xd8;
    buffer[2] = 0xff;
    buffer[3] = 0xc0;
    buffer[4] = 0x00;
    buffer[5] = 0x11;
    buffer.writeUInt16BE(height, 7);
    buffer.writeUInt16BE(width, 9);
    return buffer;
}

function createGIFBuffer(width: number, height: number): Buffer {
    const buffer = Buffer.alloc(10);
    buffer.write("GIF89a", 0, 6, "ascii");
    buffer.writeUInt16LE(width, 6);
    buffer.writeUInt16LE(height, 8);
    return buffer;
}

function createWebPBuffer(width: number, height: number): Buffer {
    const buffer = Buffer.alloc(30);
    buffer.write("RIFF", 0, 4, "ascii");
    buffer.writeUInt32LE(22, 4);
    buffer.write("WEBP", 8, 4, "ascii");
    buffer.write("VP8 ", 12, 4, "ascii");
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(width & 0x3fff, 26);
    buffer.writeUInt16LE(height & 0x3fff, 28);
    return buffer;
}

function createBMPBuffer(width: number, height: number): Buffer {
    const buffer = Buffer.alloc(26);
    buffer.write("BM", 0, 2, "ascii");
    buffer.writeInt32LE(width, 18);
    buffer.writeInt32LE(height, 22);
    return buffer;
}

describe("getFileImageDimensions", () => {
    it("should throw error for non-image file", async () => {
        const file = new File(["content"], "file.txt", {
            type: "text/plain",
        });

        await expect(getFileImageDimensions(file)).rejects.toThrow(
            "File is not an image",
        );
    });

    it("should extract dimensions from PNG file", async () => {
        const pngBuffer = createPNGBuffer(800, 600);
        const file = createFileWithBuffer(pngBuffer, "image.png", "image/png");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(800);
        expect(dimensions.height).toBe(600);
    });

    it("should extract dimensions from JPEG file", async () => {
        const jpegBuffer = createJPEGBuffer(1920, 1080);
        const file = createFileWithBuffer(
            jpegBuffer,
            "image.jpg",
            "image/jpeg",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(1920);
        expect(dimensions.height).toBe(1080);
    });

    it("should extract dimensions from JPEG file with jpg mime type", async () => {
        const jpegBuffer = createJPEGBuffer(640, 480);
        const file = createFileWithBuffer(jpegBuffer, "image.jpg", "image/jpg");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(640);
        expect(dimensions.height).toBe(480);
    });

    it("should extract dimensions from GIF file", async () => {
        const gifBuffer = createGIFBuffer(256, 256);
        const file = createFileWithBuffer(gifBuffer, "image.gif", "image/gif");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(256);
        expect(dimensions.height).toBe(256);
    });

    it("should extract dimensions from WebP file", async () => {
        const webpBuffer = createWebPBuffer(1024, 768);
        const file = createFileWithBuffer(
            webpBuffer,
            "image.webp",
            "image/webp",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(1024);
        expect(dimensions.height).toBe(768);
    });

    it("should extract dimensions from BMP file", async () => {
        const bmpBuffer = createBMPBuffer(500, 300);
        const file = createFileWithBuffer(bmpBuffer, "image.bmp", "image/bmp");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(500);
        expect(dimensions.height).toBe(300);
    });

    it("should return null dimensions for invalid PNG", async () => {
        const invalidBuffer = Buffer.from("invalid png data");
        const file = createFileWithBuffer(
            invalidBuffer,
            "image.png",
            "image/png",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should return null dimensions for invalid JPEG", async () => {
        const invalidBuffer = Buffer.from("invalid jpeg data");
        const file = createFileWithBuffer(
            invalidBuffer,
            "image.jpg",
            "image/jpeg",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should return null dimensions for invalid GIF", async () => {
        const invalidBuffer = Buffer.from("invalid gif");
        const file = createFileWithBuffer(
            invalidBuffer,
            "image.gif",
            "image/gif",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should return null dimensions for invalid WebP", async () => {
        const invalidBuffer = Buffer.from("invalid webp");
        const file = createFileWithBuffer(
            invalidBuffer,
            "image.webp",
            "image/webp",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should return null dimensions for invalid BMP", async () => {
        const invalidBuffer = Buffer.from("invalid bmp");
        const file = createFileWithBuffer(
            invalidBuffer,
            "image.bmp",
            "image/bmp",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should return null dimensions for unsupported image format", async () => {
        const buffer = Buffer.from("some image data");
        const file = createFileWithBuffer(buffer, "image.svg", "image/svg+xml");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should handle empty file", async () => {
        const emptyBuffer = Buffer.alloc(0);
        const file = createFileWithBuffer(
            emptyBuffer,
            "empty.png",
            "image/png",
        );

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBeNull();
        expect(dimensions.height).toBeNull();
    });

    it("should handle file with arrayBuffer error", async () => {
        const file = new File(["content"], "image.png", {
            type: "image/png",
        });

        const originalArrayBuffer = file.arrayBuffer;
        file.arrayBuffer = async () => {
            throw new Error("Failed to read file");
        };

        await expect(getFileImageDimensions(file)).rejects.toThrow(
            "Failed to get image dimensions: Failed to read file",
        );

        file.arrayBuffer = originalArrayBuffer;
    });

    it("should handle BMP with negative dimensions", async () => {
        const buffer = Buffer.alloc(26);
        buffer.write("BM", 0, 2, "ascii");
        buffer.writeInt32LE(-500, 18);
        buffer.writeInt32LE(-300, 22);
        const file = createFileWithBuffer(buffer, "image.bmp", "image/bmp");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(500);
        expect(dimensions.height).toBe(300);
    });

    it("should handle very small dimensions", async () => {
        const pngBuffer = createPNGBuffer(1, 1);
        const file = createFileWithBuffer(pngBuffer, "image.png", "image/png");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(1);
        expect(dimensions.height).toBe(1);
    });

    it("should handle very large dimensions", async () => {
        const pngBuffer = createPNGBuffer(65535, 65535);
        const file = createFileWithBuffer(pngBuffer, "image.png", "image/png");

        const dimensions = await getFileImageDimensions(file);
        expect(dimensions.width).toBe(65535);
        expect(dimensions.height).toBe(65535);
    });
});

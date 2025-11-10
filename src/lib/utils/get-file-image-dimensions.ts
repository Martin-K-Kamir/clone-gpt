type FileImageDimensions = {
    width: number | null;
    height: number | null;
};

export async function getFileImageDimensions(
    file: File,
): Promise<FileImageDimensions> {
    if (!file.type.startsWith("image/")) {
        throw new Error("File is not an image");
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const dimensions = parseImageDimensions(buffer, file.type);

        return dimensions ?? { width: null, height: null };
    } catch (error) {
        throw new Error(
            `Failed to get image dimensions: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}

function parseImageDimensions(
    buffer: Buffer,
    mimeType: string,
): FileImageDimensions | null {
    try {
        if (mimeType === "image/png") {
            return parsePNGDimensions(buffer);
        } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
            return parseJPEGDimensions(buffer);
        } else if (mimeType === "image/gif") {
            return parseGIFDimensions(buffer);
        } else if (mimeType === "image/webp") {
            return parseWebPDimensions(buffer);
        } else if (mimeType === "image/bmp") {
            return parseBMPDimensions(buffer);
        }

        throw new Error(`Unsupported image format: ${mimeType}`);
    } catch {
        return null;
    }
}

function parsePNGDimensions(buffer: Buffer): FileImageDimensions | null {
    if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) {
        return null;
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    return { width, height };
}

function parseJPEGDimensions(buffer: Buffer): FileImageDimensions | null {
    if (buffer.length < 2 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return null;
    }

    let offset = 2;

    while (offset < buffer.length - 1) {
        if (buffer[offset] === 0xff) {
            const marker = buffer[offset + 1];

            if (
                marker >= 0xc0 &&
                marker <= 0xcf &&
                marker !== 0xc4 &&
                marker !== 0xc8
            ) {
                if (offset + 8 > buffer.length) break;

                const height = buffer.readUInt16BE(offset + 5);
                const width = buffer.readUInt16BE(offset + 7);

                return { width, height };
            }
        }
        offset++;
    }

    return null;
}

function parseGIFDimensions(buffer: Buffer): FileImageDimensions | null {
    if (buffer.length < 10) return null;

    const signature = buffer.toString("ascii", 0, 6);
    if (signature !== "GIF87a" && signature !== "GIF89a") {
        return null;
    }

    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);

    return { width, height };
}

function parseWebPDimensions(buffer: Buffer): FileImageDimensions | null {
    if (buffer.length < 12) return null;

    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);

    if (riff !== "RIFF" || webp !== "WEBP") {
        return null;
    }

    const chunkType = buffer.toString("ascii", 12, 16);

    if (chunkType === "VP8 ") {
        if (buffer.length < 30) return null;

        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;

        return { width, height };
    } else if (chunkType === "VP8L") {
        if (buffer.length < 25) return null;

        const bits = buffer.readUInt32LE(21);
        const width = (bits & 0x3fff) + 1;
        const height = ((bits >> 14) & 0x3fff) + 1;

        return { width, height };
    }

    return null;
}

function parseBMPDimensions(buffer: Buffer): FileImageDimensions | null {
    if (buffer.length < 26) return null;

    const signature = buffer.toString("ascii", 0, 2);
    if (signature !== "BM") {
        return null;
    }

    const width = buffer.readInt32LE(18);
    const height = buffer.readInt32LE(22);

    return { width: Math.abs(width), height: Math.abs(height) };
}

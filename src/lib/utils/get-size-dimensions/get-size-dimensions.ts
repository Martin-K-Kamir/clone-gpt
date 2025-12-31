export function getSizeDimensions(size: string) {
    const [width, height] = size.split("x");

    if (!width || !height) {
        throw new Error(`Invalid size format: ${size}`);
    }

    return { width: Number(width), height: Number(height) } as const;
}

export function getMediaTypeExtension(mediaType: string) {
    const [, extension] = mediaType.split("/");

    if (!extension) {
        throw new Error(`Invalid media type format: ${mediaType}`);
    }

    return extension;
}

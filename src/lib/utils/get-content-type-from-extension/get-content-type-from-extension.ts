import { FILE_EXTENSION, MIME_TYPE } from "@/lib/constants/system";

export function getContentTypeFromExtension(extension: string): string | null {
    if (!extension) {
        return null;
    }

    const normalizedExt = extension.startsWith(".")
        ? extension.slice(1).toUpperCase()
        : extension.toUpperCase();

    const extWithDot = `.${normalizedExt.toLowerCase()}`;

    const fileExtensionKey = Object.keys(FILE_EXTENSION).find(
        key =>
            FILE_EXTENSION[key as keyof typeof FILE_EXTENSION] === extWithDot,
    ) as keyof typeof FILE_EXTENSION | undefined;

    if (!fileExtensionKey) {
        return null;
    }

    return (MIME_TYPE as Record<string, string>)[fileExtensionKey] ?? null;
}

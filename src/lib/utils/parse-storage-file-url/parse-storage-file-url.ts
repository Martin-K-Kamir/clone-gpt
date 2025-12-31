export function parseStorageFileUrl(url: string | undefined) {
    try {
        if (!url) {
            return null;
        }

        const lastSegment = url.split("/").pop();

        if (!lastSegment) {
            return null;
        }

        const lastDotIndex = lastSegment.lastIndexOf(".");

        if (lastDotIndex === -1) {
            return {
                filename: lastSegment,
                extension: "",
            };
        }

        let filename = lastSegment.substring(0, lastDotIndex);
        const extension = lastSegment.substring(lastDotIndex + 1);

        filename = filename.replace(
            /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
            "",
        );

        return {
            filename,
            extension,
        };
    } catch {
        return null;
    }
}

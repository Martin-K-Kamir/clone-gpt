export function removeFileExtension(fileName: string | File) {
    if (fileName instanceof File) {
        return fileName.name.replace(/\.[^/.]+$/, "");
    }

    return fileName.replace(/\.[^/.]+$/, "");
}

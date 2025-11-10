export function getFileExtension(file: string | File) {
    if (file instanceof File) {
        return file.name.split(".").pop() || "";
    }

    return file.split(".").pop() || "";
}

export function isFileTypeAllowed(
    file: File,
    acceptedTypes: readonly string[],
): boolean {
    const result = acceptedTypes.some(acceptedType => {
        if (acceptedType.endsWith("*")) {
            const baseType = acceptedType.slice(0, -1);
            const matches = file.type.startsWith(baseType);
            return matches;
        }

        if (file.type === acceptedType) {
            return true;
        }

        if (file.name && acceptedType.startsWith(".")) {
            const matches = file.name
                .toLowerCase()
                .endsWith(acceptedType.toLowerCase());
            return matches;
        }

        return false;
    });

    return result;
}

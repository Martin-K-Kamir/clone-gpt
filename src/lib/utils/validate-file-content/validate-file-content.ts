import { fileTypeFromBuffer } from "file-type";

import { isFileTypeAllowed } from "@/lib/utils/is-file-type-allowed";

export async function validateFileContent(
    file: File,
    acceptedTypes: readonly string[],
): Promise<{
    isValid: boolean;
    claimedType: string;
    actualType?: string;
}> {
    try {
        const buffer = await file.arrayBuffer();
        const actualFileType = await fileTypeFromBuffer(buffer);
        const isAcceptedType = isFileTypeAllowed(file, acceptedTypes);

        if (!isAcceptedType) {
            return {
                isValid: false,
                actualType: actualFileType?.mime,
                claimedType: file.type,
            };
        }

        if (!actualFileType) {
            return {
                isValid: true,
                claimedType: file.type,
            };
        }

        const typesMatch = actualFileType.mime === file.type;

        if (!typesMatch) {
            return {
                isValid: false,
                actualType: actualFileType.mime,
                claimedType: file.type,
            };
        }

        return {
            isValid: true,
            actualType: actualFileType.mime,
            claimedType: file.type,
        };
    } catch {
        return {
            isValid: false,
            claimedType: file.type,
        };
    }
}

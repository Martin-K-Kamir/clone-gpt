import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type { ChatUploadedFile } from "@/features/chat/lib/types";
import { convertFilesToMessageParts } from "@/features/chat/lib/utils/convert-files-to-message-parts";

export function createUserMessage(
    text: string,
    uploadedFiles: ChatUploadedFile[],
    selectedFiles: File[],
) {
    const files = convertFilesToMessageParts({
        uploadedFiles,
        filesPreview: selectedFiles,
    });

    return {
        role: CHAT_ROLE.USER,
        metadata: {
            role: CHAT_ROLE.USER,
            createdAt: new Date().toISOString(),
        },
        parts: [
            {
                text,
                type: CHAT_MESSAGE_TYPE.TEXT,
            },
            ...files,
        ],
    };
}

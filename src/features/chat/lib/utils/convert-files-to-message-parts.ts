import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { ChatUploadedFile } from "@/features/chat/lib/types";

export function convertFilesToMessageParts({
    uploadedFiles,
    filesPreview,
}: {
    uploadedFiles: ChatUploadedFile[];
    filesPreview: File[];
}) {
    return uploadedFiles
        .filter(file =>
            filesPreview.some(preview => preview.name === file.name),
        )
        .map(file => {
            const base = {
                size: file.size,
                extension: file.extension,
                mediaType: file.mediaType,
                url: file.fileUrl,
                name: file.name,
            };

            if (file.kind === CHAT_MESSAGE_TYPE.FILE) {
                return {
                    ...base,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    kind: CHAT_MESSAGE_TYPE.FILE,
                };
            }

            if (file.kind === CHAT_MESSAGE_TYPE.IMAGE) {
                return {
                    ...base,
                    type: CHAT_MESSAGE_TYPE.FILE,
                    kind: CHAT_MESSAGE_TYPE.IMAGE,
                    width: file.width,
                    height: file.height,
                };
            }

            if (file.kind === CHAT_MESSAGE_TYPE.TEXT) {
                return {
                    ...base,
                    type: CHAT_MESSAGE_TYPE.TEXT,
                    kind: CHAT_MESSAGE_TYPE.FILE,
                    text: `Here is the user uploaded file: ${file.name} and the file content: ${file.text}`,
                    isVisible: false,
                };
            }

            const _exhaustiveCheck: never = file;
            throw new Error(`Invalid file kind: ${_exhaustiveCheck}`);
        });
}

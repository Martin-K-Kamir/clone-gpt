import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type {
    ChatMessagePart,
    WithMessagePart,
    WithNewChatId,
} from "@/features/chat/lib/types";
import { isGenerateFileToolPart } from "@/features/chat/lib/utils/is-generate-file-tool-part";
import { isGenerateImageToolPart } from "@/features/chat/lib/utils/is-generate-image-tool-part";
import { isUserFileMessagePart } from "@/features/chat/lib/utils/is-user-file-message-part";
import { duplicateStorageFile } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

export async function duplicateMessagePart({
    part,
    userId,
    newChatId,
}: WithMessagePart & WithUserId & WithNewChatId): Promise<ChatMessagePart> {
    if (isGenerateImageToolPart(part)) {
        const storedImage = await duplicateStorageFile({
            userId,
            chatId: newChatId,
            url: part.output.imageUrl,
            name: part.output.name,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });

        return {
            ...part,
            output: {
                ...part.output,
                imageUrl: storedImage.fileUrl,
                id: storedImage.fileId,
                name: storedImage.name,
            },
        };
    }

    if (isGenerateFileToolPart(part)) {
        const storedFile = await duplicateStorageFile({
            userId,
            chatId: newChatId,
            url: part.output.fileUrl,
            name: part.output.name,
            bucket: STORAGE_BUCKET.GENERATED_FILES,
        });

        return {
            ...part,
            output: {
                ...part.output,
                fileUrl: storedFile.fileUrl,
                id: storedFile.fileId,
                name: storedFile.name,
            },
        };
    }

    if (isUserFileMessagePart(part)) {
        const storedFile = await duplicateStorageFile({
            userId,
            chatId: newChatId,
            url: part.url,
            name: part.name,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        return {
            ...part,
            url: storedFile.fileUrl,
        } as ChatMessagePart;
    }

    return part;
}

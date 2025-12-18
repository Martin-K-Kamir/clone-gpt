import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { WithChatId } from "@/features/chat/lib/types";
import { uploadToStorage } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import type { WithFile } from "@/lib/types";
import { getFileExtension, removeFileExtension } from "@/lib/utils";

export async function storeUserFile({
    file,
    userId,
    chatId,
}: WithFile & WithChatId & WithUserId) {
    const fileExtension = getFileExtension(file);
    const fileName = removeFileExtension(file);

    const { id, publicUrl } = await uploadToStorage({
        userId,
        chatId,
        name: fileName,
        bucket: STORAGE_BUCKET.USER_FILES,
        extension: fileExtension,
        content: file,
        contentType: file.type,
    });

    return {
        fileId: id,
        name: file.name,
        fileUrl: publicUrl,
        mediaType: file.type,
    };
}

import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { WithChatId, WithGeneratedFile } from "@/features/chat/lib/types";
import { uploadToStorage } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import type { WithContentType, WithExtension, WithName } from "@/lib/types";

export async function storeGeneratedFile({
    generatedFile,
    name,
    extension,
    chatId,
    userId,
    contentType,
}: WithGeneratedFile &
    WithChatId &
    WithUserId &
    WithName &
    WithExtension &
    WithContentType) {
    const { id, publicUrl } = await uploadToStorage({
        userId,
        chatId,
        name,
        extension,
        contentType,
        bucket: STORAGE_BUCKET.GENERATED_FILES,
        content: generatedFile,
    });

    return { name, fileId: id, fileUrl: publicUrl };
}

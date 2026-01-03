import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type {
    WithChatId,
    WithStoredUploadedFile,
} from "@/features/chat/lib/types";
import { hashId } from "@/features/chat/services/storage";

import type { WithUserId } from "@/features/user/lib/types";

import { getFileExtension, removeFileExtension } from "@/lib/utils";

import { supabase } from "@/services/supabase";

type DeleteUserFileProps = WithStoredUploadedFile & WithChatId & WithUserId;

export async function deleteUserFile({
    storedFile,
    chatId,
    userId,
}: DeleteUserFileProps) {
    const fileId = storedFile.fileId;
    const fileName = removeFileExtension(storedFile.name);
    const fileExtension = getFileExtension(storedFile.name);
    const hashedUserId = hashId(userId);
    const hashedChatId = hashId(chatId);
    const filePath = `${hashedUserId}/${hashedChatId}/${fileName}-${fileId}.${fileExtension}`;

    const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET.USER_FILES)
        .remove([filePath]);

    if (deleteError) {
        throw new Error(
            `Failed to delete file from storage: ${deleteError.message}`,
        );
    }

    return {
        fileId: storedFile.fileId,
    };
}

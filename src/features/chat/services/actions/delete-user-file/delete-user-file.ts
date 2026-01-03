"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsDBChatId,
    assertIsStoredUploadedFile,
} from "@/features/chat/lib/asserts";
import type {
    WithChatId,
    WithStoredUploadedFile,
} from "@/features/chat/lib/types";
import { deleteUserFile as _deleteUserFile } from "@/features/chat/services/storage";

import { api } from "@/lib/api-response";
import { handleApiError } from "@/lib/utils/handle-api-error";

type DeleteUserFileProps = WithStoredUploadedFile & WithChatId;

export async function deleteUserFile({
    storedFile,
    chatId,
}: DeleteUserFileProps) {
    try {
        const session = await auth();
        assertIsStoredUploadedFile(storedFile);
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const data = await _deleteUserFile({
            storedFile,
            chatId,
            userId: session.user.id,
        });

        return api.success.file.delete(data.fileId, {
            fileName: storedFile.name,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.file.delete(error, {
                fileName: storedFile.name,
            }),
        );
    }
}

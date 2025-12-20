"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsDBChatId,
    assertIsStoredUploadedFiles,
} from "@/features/chat/lib/asserts";
import type {
    WithChatId,
    WithStoredUploadedFiles,
} from "@/features/chat/lib/types";
import { deleteUserFile } from "@/features/chat/services/storage";

import { api } from "@/lib/api-response";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function deleteUserFiles({
    storedFiles,
    chatId,
}: WithStoredUploadedFiles & WithChatId) {
    try {
        const session = await auth();
        assertIsStoredUploadedFiles(storedFiles);
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const data = await Promise.all(
            storedFiles.map(file =>
                deleteUserFile({
                    chatId,
                    storedFile: file,
                    userId: session.user.id,
                }),
            ),
        );

        return api.success.file.deleteMany(data, {
            count: storedFiles.length,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.file.deleteMany(error, {
                count: storedFiles.length,
            }),
        );
    }
}

"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { WithChatId } from "@/features/chat/lib/types";
import {
    deleteUserChatById as _deleteUserChatById,
    isUserChatOwner,
} from "@/features/chat/services/db";
import { deleteStorageDirectory } from "@/features/chat/services/storage";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function deleteUserChatById({ chatId }: WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatId(chatId);

        const isOwner = await isUserChatOwner({
            chatId,
            userId: session.user.id,
        });

        if (!isOwner) {
            return api.error.session.authorization();
        }

        await _deleteUserChatById({ chatId, userId: session.user.id });

        deleteStorageDirectory({
            chatId,
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });
        deleteStorageDirectory({
            chatId,
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_FILES,
        });
        deleteStorageDirectory({
            chatId,
            userId: session.user.id,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        return api.success.chat.delete(chatId, {
            count: PLURAL.SINGLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.SINGLE }),
        );
    }
}

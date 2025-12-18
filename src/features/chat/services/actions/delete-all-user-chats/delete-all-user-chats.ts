"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import { deleteAllUserChats as _deleteAllUserChats } from "@/features/chat/services/db";
import { deleteStorageDirectory } from "@/features/chat/services/storage";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function deleteAllUserChats() {
    try {
        const session = await auth();
        assertSessionExists(session);

        await _deleteAllUserChats({ userId: session.user.id });

        deleteStorageDirectory({
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_IMAGES,
        });
        deleteStorageDirectory({
            userId: session.user.id,
            bucket: STORAGE_BUCKET.GENERATED_FILES,
        });
        deleteStorageDirectory({
            userId: session.user.id,
            bucket: STORAGE_BUCKET.USER_FILES,
        });

        return api.success.chat.delete(undefined, {
            count: PLURAL.MULTIPLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.MULTIPLE }),
        );
    }
}

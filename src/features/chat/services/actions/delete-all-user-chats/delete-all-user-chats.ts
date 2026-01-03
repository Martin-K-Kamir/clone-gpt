"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import { deleteStorageDirectory } from "@/features/chat/services/storage";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function deleteAllUserChats() {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);

        const { error: messageError } = await supabase
            .from("messages")
            .delete()
            .eq("userId", userId);

        if (messageError) throw new Error("Failed to delete all user messages");

        const { error } = await supabase
            .from("chats")
            .delete()
            .eq("userId", userId);

        if (error) throw new Error("Failed to delete all user chats");

        await Promise.all([
            deleteStorageDirectory({
                userId: session.user.id,
                bucket: STORAGE_BUCKET.GENERATED_IMAGES,
            }),
            deleteStorageDirectory({
                userId: session.user.id,
                bucket: STORAGE_BUCKET.GENERATED_FILES,
            }),
            deleteStorageDirectory({
                userId: session.user.id,
                bucket: STORAGE_BUCKET.USER_FILES,
            }),
        ]);

        updateTag(tag.userChats(userId));
        updateTag(tag.userSharedChats(userId));
        updateTag(tag.userChatsSearch(userId));

        return api.success.chat.delete(undefined, {
            count: PLURAL.MULTIPLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.MULTIPLE }),
        );
    }
}

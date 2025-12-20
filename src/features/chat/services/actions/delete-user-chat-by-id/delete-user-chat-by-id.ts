"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import { STORAGE_BUCKET } from "@/features/chat/lib/constants";
import type { WithChatId } from "@/features/chat/lib/types";
import { isUserChatOwner } from "@/features/chat/services/db";
import { deleteStorageDirectory } from "@/features/chat/services/storage";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function deleteUserChatById({ chatId }: WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBChatId(chatId);
        assertIsDBUserId(userId);

        const isOwner = await isUserChatOwner({
            chatId,
            userId: session.user.id,
        });

        if (!isOwner) {
            return api.error.session.authorization();
        }

        const { error: messageError } = await supabase
            .from("messages")
            .delete()
            .eq("chatId", chatId);

        if (messageError) throw new Error("Failed to delete chat messages");

        const { error } = await supabase
            .from("chats")
            .delete()
            .eq("id", chatId);

        if (error) throw new Error("Chat delete failed");

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

        updateTag(tag.userChats(userId));
        updateTag(tag.userSharedChats(userId));
        updateTag(tag.userChatsSearch(userId));
        updateTag(tag.chatVisibility(chatId));

        return api.success.chat.delete(chatId, {
            count: PLURAL.SINGLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.SINGLE }),
        );
    }
}

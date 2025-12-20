"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsChatTitle,
    assertIsDBChatId,
} from "@/features/chat/lib/asserts";
import type { WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { assertIsNonEmptyString } from "@/lib/asserts";
import { tag } from "@/lib/cache-tag";
import type { WithNewTitle } from "@/lib/types";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    const NEW_CHAT_MAX_TITLE_LENGHT = 25;

    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsChatTitle(newTitle);
        assertIsDBChatId(chatId);

        const newChatTitle =
            newTitle.length > NEW_CHAT_MAX_TITLE_LENGHT
                ? `${newTitle.slice(0, NEW_CHAT_MAX_TITLE_LENGHT)}...`
                : newTitle;

        assertIsNonEmptyString(newChatTitle);

        const { error } = await supabase
            .from("chats")
            .update({ title: newChatTitle })
            .eq("id", chatId)
            .eq("userId", userId);

        if (error) throw new Error("Failed to update chat title");

        updateTag(tag.userChats(userId));
        updateTag(tag.userChat(chatId));
        updateTag(tag.userSharedChats(userId));

        return api.success.chat.rename(chatId);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.rename(error));
    }
}

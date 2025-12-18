"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsChatTitle,
    assertIsDBChatId,
} from "@/features/chat/lib/asserts";
import type { WithChatId } from "@/features/chat/lib/types";
import { updateChatTitle as _updateChatTitle } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import type { WithNewTitle } from "@/lib/types";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    const NEW_CHAT_MAX_TITLE_LENGHT = 25;

    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsChatTitle(newTitle);
        assertIsDBChatId(chatId);

        await _updateChatTitle({
            chatId,
            userId: session.user.id,
            newTitle:
                newTitle.length > NEW_CHAT_MAX_TITLE_LENGHT
                    ? `${newTitle.slice(0, NEW_CHAT_MAX_TITLE_LENGHT)}...`
                    : newTitle,
        });

        return api.success.chat.rename(chatId);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.rename(error));
    }
}

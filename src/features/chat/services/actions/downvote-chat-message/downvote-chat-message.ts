"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsDBChatId,
    assertIsDBChatMessageId,
    assertIsDownvote,
} from "@/features/chat/lib/asserts";
import type {
    WithChatId,
    WithChatMessageId,
    WithDownvote,
} from "@/features/chat/lib/types";
import { downvoteChatMessage as _downvoteChatMessage } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function downvoteChatMessage({
    downvote,
    messageId,
    chatId,
}: WithDownvote & WithChatId & WithChatMessageId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatMessageId(messageId);
        assertIsDBChatId(chatId);
        assertIsDownvote(downvote);

        const data = await _downvoteChatMessage({
            downvote,
            messageId,
            chatId,
            userId: session.user.id,
        });

        return api.success.chat.downvote(data);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.downvote(error));
    }
}

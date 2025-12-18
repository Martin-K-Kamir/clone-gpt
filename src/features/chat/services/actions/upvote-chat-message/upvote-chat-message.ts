"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsDBChatId,
    assertIsDBChatMessageId,
    assertIsUpvote,
} from "@/features/chat/lib/asserts";
import type {
    WithChatId,
    WithChatMessageId,
    WithUpvote,
} from "@/features/chat/lib/types";
import { upvoteChatMessage as _upvoteChatMessage } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function upvoteChatMessage({
    upvote,
    messageId,
    chatId,
}: WithUpvote & WithChatId & WithChatMessageId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsDBChatMessageId(messageId);
        assertIsDBChatId(chatId);
        assertIsUpvote(upvote);

        const data = await _upvoteChatMessage({
            upvote,
            messageId,
            chatId,
            userId: session.user.id,
        });

        return api.success.chat.upvote(data);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.upvote(error));
    }
}

"use server";

import { updateTag } from "next/cache";

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

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function downvoteChatMessage({
    downvote,
    messageId,
    chatId,
}: WithDownvote & WithChatId & WithChatMessageId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBChatMessageId(messageId);
        assertIsDBChatId(chatId);
        assertIsDownvote(downvote);
        assertIsDBUserId(userId);

        const { data: currentMessage } = await supabase
            .from("messages")
            .select("metadata")
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentMetadata = (currentMessage?.metadata as any) || {};

        const updatedMetadata = {
            ...currentMetadata,
            isDownvoted: downvote,
            isUpvoted: false,
        };

        const { data, error } = await supabase
            .from("messages")
            .update({
                metadata: updatedMetadata,
            })
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .select("*")
            .single();

        if (error) throw new Error("Failed to downvote message");

        updateTag(tag.chatMessages(chatId));

        return api.success.chat.downvote(data);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.downvote(error));
    }
}

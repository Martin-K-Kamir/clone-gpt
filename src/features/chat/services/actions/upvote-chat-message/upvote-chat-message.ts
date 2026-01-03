"use server";

import { updateTag } from "next/cache";

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

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

type UpvoteChatMessageProps = WithUpvote & WithChatId & WithChatMessageId;

export async function upvoteChatMessage({
    upvote,
    messageId,
    chatId,
}: UpvoteChatMessageProps) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsDBChatMessageId(messageId);
        assertIsDBChatId(chatId);
        assertIsUpvote(upvote);

        const { data: currentMessage } = await supabase
            .from("messages")
            .select("metadata")
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentMetadata = (currentMessage?.metadata as any) || {};

        const { data, error } = await supabase
            .from("messages")
            .update({
                metadata: {
                    ...currentMetadata,
                    isUpvoted: upvote,
                    isDownvoted: false,
                },
            })
            .eq("id", messageId)
            .eq("userId", userId)
            .eq("chatId", chatId)
            .select("*")
            .single();

        if (error) throw new Error("Failed to upvote message");

        updateTag(tag.chatMessages(chatId));

        return api.success.chat.upvote(data);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.upvote(error));
    }
}

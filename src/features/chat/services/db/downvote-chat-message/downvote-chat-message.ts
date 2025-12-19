"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsDBChatId,
    assertIsDBChatMessageId,
    assertIsDownvote,
} from "@/features/chat/lib/asserts";
import type {
    UIChatMessage,
    WithChatId,
    WithChatMessageId,
    WithDownvote,
} from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

type DownvoteChatMessageProps = WithDownvote &
    WithChatId &
    WithUserId &
    WithChatMessageId;

export async function downvoteChatMessage({
    downvote,
    messageId,
    userId,
    chatId,
}: DownvoteChatMessageProps) {
    assertIsDBChatMessageId(messageId);
    assertIsDownvote(downvote);
    assertIsDBUserId(userId);
    assertIsDBChatId(chatId);

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
                isDownvoted: downvote,
                isUpvoted: false,
            },
        })
        .eq("id", messageId)
        .eq("userId", userId)
        .eq("chatId", chatId)
        .select("*")
        .single();

    if (error) throw new Error("Failed to downvote message");

    revalidateTag(tag.chatMessages(chatId));

    return data as unknown as UIChatMessage | null;
}

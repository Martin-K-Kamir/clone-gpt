"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsDBChatId,
    assertIsDBChatMessageId,
    assertIsUpvote,
} from "@/features/chat/lib/asserts";
import type {
    UIChatMessage,
    WithChatId,
    WithChatMessageId,
    WithUpvote,
} from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

type UpvoteChatMessageProps = WithUpvote &
    WithChatId &
    WithUserId &
    WithChatMessageId;

export async function upvoteChatMessage({
    upvote,
    messageId,
    userId,
    chatId,
}: UpvoteChatMessageProps) {
    assertIsUpvote(upvote);
    assertIsDBChatMessageId(messageId);
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

    revalidateTag(tag.chatMessages(chatId));

    return data as unknown as UIChatMessage | null;
}

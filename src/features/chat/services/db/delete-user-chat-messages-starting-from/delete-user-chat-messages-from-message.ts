"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsDBChatId,
    assertIsDBChatMessageId,
} from "@/features/chat/lib/asserts";
import type { WithChatId, WithChatMessageId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

type DeleteUserChatMessagesStartingFromProps = WithChatMessageId &
    WithChatId &
    WithUserId;

export async function deleteUserChatMessagesStartingFrom({
    messageId,
    chatId,
    userId,
}: DeleteUserChatMessagesStartingFromProps) {
    assertIsDBChatMessageId(messageId);
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { data: targetMessage } = await supabase
        .from("messages")
        .select("createdAt")
        .eq("id", messageId)
        .eq("chatId", chatId)
        .single();

    if (!targetMessage) {
        throw new Error("Target message not found");
    }

    const { error } = await supabase
        .from("messages")
        .delete()
        .eq("chatId", chatId)
        .gte("createdAt", targetMessage.createdAt);

    if (error) throw new Error("Failed to delete chat messages");

    revalidateTag(tag.chatMessages(chatId), "max");
    revalidateTag(tag.userChat(chatId), "max");
    revalidateTag(tag.userChatsSearch(userId), "max");
    console.log(
        "[chat db] deleted user chat messages starting from message:",
        messageId,
    );
}

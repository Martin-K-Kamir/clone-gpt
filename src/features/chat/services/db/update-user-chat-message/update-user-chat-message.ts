"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type { WithChatId, WithMessage } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";
import type { Json } from "@/lib/types";

import { supabase } from "@/services/supabase";

type UpdateUserChatMessageProps = WithMessage & WithChatId & WithUserId;

export async function updateUserChatMessage({
    message,
    chatId,
    userId,
}: UpdateUserChatMessageProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error } = await supabase
        .from("messages")
        .update({
            parts: message.parts as Json[],
            content: message.parts
                .filter(part => part.type === "text")
                .map(part => part.text)
                .join(""),
        })
        .eq("id", message.id)
        .eq("chatId", chatId)
        .eq("userId", userId);

    if (error) throw new Error("Failed to update chat message");

    revalidateTag(tag.chatMessages(chatId), "max");
    revalidateTag(tag.userChat(chatId), "max");
    revalidateTag(tag.userChatsSearch(userId), "max");
}

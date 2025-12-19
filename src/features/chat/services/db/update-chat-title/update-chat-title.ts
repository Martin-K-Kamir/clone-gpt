"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type { DBChat, WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { assertIsNonEmptyString } from "@/lib/asserts";
import { tag } from "@/lib/cache-tags";
import type { WithNewTitle } from "@/lib/types";

import { supabase } from "@/services/supabase";

type UpdateChatTitleProps = WithChatId & WithUserId & WithNewTitle;

export async function updateChatTitle({
    newTitle,
    chatId,
    userId,
}: UpdateChatTitleProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsNonEmptyString(newTitle);

    const { data, error } = await supabase
        .from("chats")
        .update({ title: newTitle })
        .eq("id", chatId)
        .eq("userId", userId)
        .select("*")
        .single();

    if (error) throw new Error("Failed to update chat title");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userSharedChats(userId));

    return data as DBChat;
}

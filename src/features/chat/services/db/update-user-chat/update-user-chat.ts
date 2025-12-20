"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsDBChatId,
    assertIsPartialChatDataValid,
} from "@/features/chat/lib/asserts";
import type { DBChat, WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

type UpdateUserChatProps = {
    data: Partial<DBChat>;
} & WithChatId &
    WithUserId;

export async function updateUserChat({
    chatId,
    userId,
    data,
}: UpdateUserChatProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsPartialChatDataValid(data);

    const { data: updatedData, error } = await supabase
        .from("chats")
        .update(data)
        .eq("id", chatId)
        .eq("userId", userId)
        .select("*")
        .single();

    if (error) throw new Error("Chat update failed");

    revalidateTag(tag.userChats(userId), "max");
    revalidateTag(tag.userChat(chatId), "max");

    console.log("[chat db] updated user chat:", updatedData);
    return updatedData as DBChat;
}

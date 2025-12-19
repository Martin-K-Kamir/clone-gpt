"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type { WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

type DeleteUserChatByIdProps = WithChatId & WithUserId;

export async function deleteUserChatById({
    chatId,
    userId,
}: DeleteUserChatByIdProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error: messageError } = await supabase
        .from("messages")
        .delete()
        .eq("chatId", chatId);

    if (messageError) throw new Error("Failed to delete chat messages");

    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) throw new Error("Chat delete failed");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
    revalidateTag(tag.chatVisibility(chatId));
}

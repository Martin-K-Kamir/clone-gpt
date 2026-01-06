"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsChatTitle,
    assertIsDBChatId,
} from "@/features/chat/lib/asserts";
import type { DBChat, WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";
import type { WithOptionalThrowOnNotFound, WithTitle } from "@/lib/types";

import { supabase } from "@/services/supabase";

type CreateUserChatProps = WithTitle &
    WithChatId &
    WithUserId &
    WithOptionalThrowOnNotFound;

export async function createUserChat({
    chatId,
    userId,
    title,
    throwOnNotFound = true,
}: CreateUserChatProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsChatTitle(title);

    const { data, error } = await supabase
        .from("chats")
        .insert({
            title,
            userId,
            id: chatId,
            updatedAt: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (error) throw new Error("Chat insert failed");
    if (!data && throwOnNotFound) throw new Error("Chat not found");
    if (!data) return null;

    revalidateTag(tag.userChats(userId), "max");
    revalidateTag(tag.userChat(chatId), "max");

    return data as DBChat;
}

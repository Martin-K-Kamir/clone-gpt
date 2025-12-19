"use server";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type { WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export type IsUserChatOwnerProps = WithChatId & WithUserId;

export async function isUserChatOwner({
    chatId,
    userId,
}: IsUserChatOwnerProps): Promise<boolean> {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("id", chatId)
        .eq("userId", userId)
        .single();

    if (error) throw new Error("Failed to check chat ownership");

    return !!data;
}

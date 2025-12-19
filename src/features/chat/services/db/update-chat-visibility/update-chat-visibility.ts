"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsChatVisibility,
    assertIsDBChatId,
} from "@/features/chat/lib/asserts";
import type { WithChatId, WithVisibility } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

type UpdateChatVisibilityProps = WithChatId & WithUserId & WithVisibility;

export async function updateChatVisibility({
    visibility,
    chatId,
    userId,
}: UpdateChatVisibilityProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsChatVisibility(visibility);

    const { data, error } = await supabase
        .from("chats")
        .update({ visibility, visibleAt: new Date().toISOString() })
        .eq("id", chatId)
        .eq("userId", userId)
        .select("visibility")
        .single();

    if (error) throw new Error("Failed to update chat visibility");

    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.chatVisibility(chatId));
    revalidateTag(tag.userSharedChats(userId));

    return data;
}

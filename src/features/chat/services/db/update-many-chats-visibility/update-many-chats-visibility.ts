"use server";

import { revalidateTag } from "next/cache";

import {
    assertIsChatVisibility,
    assertIsDBChatIds,
} from "@/features/chat/lib/asserts";
import type {
    DBChat,
    DBChatId,
    WithVisibility,
} from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

type UpdateManyChatsVisibilityProps = {
    chatIds: DBChatId[];
} & WithUserId &
    WithVisibility;

export async function updateManyChatsVisibility({
    visibility,
    chatIds,
    userId,
}: UpdateManyChatsVisibilityProps) {
    assertIsDBUserId(userId);
    assertIsDBChatIds(chatIds);
    assertIsChatVisibility(visibility);

    const { data, error } = await supabase
        .from("chats")
        .update({ visibility, visibleAt: new Date().toISOString() })
        .eq("userId", userId)
        .in("id", chatIds)
        .select("*");

    if (error) throw new Error("Failed to update chat visibility");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
    chatIds.forEach(chatId => {
        revalidateTag(tag.chatVisibility(chatId));
    });

    return data as DBChat[];
}

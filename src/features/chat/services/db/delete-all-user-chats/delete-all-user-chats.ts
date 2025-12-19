"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

export async function deleteAllUserChats({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { error: messageError } = await supabase
        .from("messages")
        .delete()
        .eq("userId", userId);

    if (messageError) throw new Error("Failed to delete all user messages");

    const { error } = await supabase
        .from("chats")
        .delete()
        .eq("userId", userId);

    if (error) throw new Error("Failed to delete all user chats");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
}

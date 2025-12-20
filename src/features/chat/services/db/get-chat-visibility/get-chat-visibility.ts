"use server";

import { cacheTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type { DBChat, WithChatId } from "@/features/chat/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

export async function getChatVisibility({ chatId }: WithChatId) {
    "use cache";
    assertIsDBChatId(chatId);
    cacheTag(tag.chatVisibility(chatId));

    const { data, error } = await supabase
        .from("chats")
        .select("visibility, userId")
        .eq("id", chatId)
        .single();
    if (error) throw new Error("Failed to fetch chat visibility");

    return data as Pick<DBChat, "visibility" | "userId"> | null;
}

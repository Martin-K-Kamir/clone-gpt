"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type {
    DBChatMessageRole,
    WithChatId,
    WithMessage,
} from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";
import type { Json } from "@/lib/types";

import { supabase } from "@/services/supabase";

type StoreUserChatMessageProps = WithMessage & WithChatId & WithUserId;

export async function storeUserChatMessage({
    message,
    chatId,
    userId,
}: StoreUserChatMessageProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error } = await supabase.from("messages").insert({
        chatId,
        userId,
        id: message.id,
        createdAt: message.metadata?.createdAt ?? new Date().toISOString(),
        role: message.role as DBChatMessageRole,
        metadata: message.metadata as Json,
        parts: message.parts as Json[],
        content: message.parts
            .filter(part => part.type === "text")
            .map(part => part.text)
            .join(""),
    });

    if (error) throw new Error("Failed to store chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] stored user chat message:", message);
}

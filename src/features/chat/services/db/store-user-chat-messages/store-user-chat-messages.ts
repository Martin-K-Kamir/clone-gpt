"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type {
    DBChatMessageRole,
    UIChatMessage,
    WithChatId,
} from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";
import type { Json } from "@/lib/types";

import { supabase } from "@/services/supabase";

type StoreUserChatMessagesProps = WithChatId &
    WithUserId & {
        preserveCreatedAt?: boolean;
        messages: (UIChatMessage & { createdAt?: string })[];
    };

export async function storeUserChatMessages({
    messages,
    chatId,
    userId,
    preserveCreatedAt = false,
}: StoreUserChatMessagesProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    console.log(
        "[chat db] storing user chat messages --------------:",
        JSON.stringify(messages, null, 2),
    );

    const { error } = await supabase.from("messages").insert(
        messages.map((message, index) => {
            const fallbackCreatedAt = new Date(
                Date.now() + index * 1000,
            ).toISOString();

            const messageCreatedAt =
                message.createdAt ??
                message.metadata?.createdAt ??
                fallbackCreatedAt;

            const createdAt = preserveCreatedAt
                ? messageCreatedAt
                : fallbackCreatedAt;

            return {
                chatId,
                userId,
                createdAt,
                id: message.id,
                role: message.role as DBChatMessageRole,
                metadata: message.metadata as Json,
                parts: message.parts as Json[],
                content: message.parts
                    .filter(part => part.type === "text")
                    .map(part => part.text)
                    .join(""),
            };
        }),
    );

    if (error) throw new Error("Failed to store chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] stored user chat messages:", messages);
}

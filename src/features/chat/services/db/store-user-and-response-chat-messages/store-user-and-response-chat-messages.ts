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

type StoreUserAndResponseChatMessagesProps = WithChatId &
    WithUserId & {
        userMessage: UIChatMessage;
        responseMessage: UIChatMessage;
    };

export async function storeUserAndResponseChatMessages({
    userMessage,
    responseMessage,
    chatId,
    userId,
}: StoreUserAndResponseChatMessagesProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error: userMessageError } = await supabase.from("messages").insert({
        chatId,
        userId,
        id: userMessage.id,
        role: userMessage.role as DBChatMessageRole,
        metadata: userMessage.metadata as Json,
        parts: userMessage.parts as Json[],
        content: userMessage.parts
            .filter(part => part.type === "text")
            .map(part => part.text)
            .join(""),
    });

    if (userMessageError) throw new Error("Failed to store user chat message");

    const { error: responseMessageError } = await supabase
        .from("messages")
        .insert({
            chatId,
            userId,
            id: responseMessage.id,
            role: responseMessage.role as DBChatMessageRole,
            metadata: responseMessage.metadata as Json,
            parts: responseMessage.parts as Json[],
            content: responseMessage.parts
                .filter(part => part.type === "text")
                .map(part => part.text)
                .join(""),
        });

    if (responseMessageError)
        throw new Error("Failed to store response chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] stored user and assistant chat messages:", {
        userMessage,
        responseMessage,
    });
}

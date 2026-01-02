"use server";

import { cacheTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type {
    UIChatMessage,
    WithChatId,
    WithOptionalVerifyChatAccess,
} from "@/features/chat/lib/types";
import { getChatAccess } from "@/features/chat/services/db/get-chat-access";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

type GetUserChatMessagesProps = WithChatId &
    WithUserId &
    WithOptionalVerifyChatAccess;

export async function getUserChatMessages({
    chatId,
    userId,
    verifyChatAccess = true,
}: GetUserChatMessagesProps) {
    "use cache";
    cacheTag(tag.chatMessages(chatId));
    return uncachedGetUserChatMessages({
        chatId,
        userId,
        verifyChatAccess,
    });
}

export async function uncachedGetUserChatMessages({
    chatId,
    userId,
    verifyChatAccess = true,
}: GetUserChatMessagesProps) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const chatAccess = verifyChatAccess
        ? await getChatAccess({ chatId, userId })
        : undefined;

    if (verifyChatAccess && !chatAccess?.allowed) {
        throw new Error(
            "The chat is not accessible. It may be private or no longer exists.",
        );
    }

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chatId", chatId)
        .order("createdAt", { ascending: true });

    if (error) throw new Error("Failed to fetch chat messages");

    const messages = data ?? [];

    if (chatAccess?.isOwner === false) {
        return {
            data: messages.map(message => ({
                ...message,
                metadata: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(message.metadata as any),
                    isUpvoted: false,
                    isDownvoted: false,
                },
            })) as unknown as UIChatMessage[],
            visibility: chatAccess?.visibility,
            isOwner: chatAccess?.isOwner,
        };
    }

    return {
        data: messages as unknown as UIChatMessage[],
        visibility: chatAccess?.visibility,
        isOwner: chatAccess?.isOwner,
    };
}

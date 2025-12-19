"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type {
    DBChat,
    WithChatId,
    WithIsOwner,
    WithOptionalVerifyChatAccess,
} from "@/features/chat/lib/types";
import { getChatAccess } from "@/features/chat/services/db/get-chat-access";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";
import type { WithOptionalThrowOnNotFound } from "@/lib/types";

import { supabase } from "@/services/supabase";

type GetUserChatByIdProps = WithOptionalVerifyChatAccess &
    WithChatId &
    WithUserId &
    WithOptionalThrowOnNotFound;

export async function getUserChatById({
    chatId,
    userId,
    verifyChatAccess = true,
    throwOnNotFound = true,
}: GetUserChatByIdProps) {
    "use cache";
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    cacheTag(tag.userChat(chatId));

    const chatAccess = verifyChatAccess
        ? await getChatAccess({ chatId, userId })
        : undefined;

    if (verifyChatAccess && !chatAccess?.allowed) {
        throw new Error(
            "The chat is not accessible. It may be private or no longer exists.",
        );
    }

    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .maybeSingle();

    if (error) throw new Error("Failed to fetch user chat");
    if (!data && throwOnNotFound) throw new Error("Chat not found");
    if (!data) return null;

    return {
        ...data,
        isOwner: data.userId === userId,
    } as DBChat & WithIsOwner;
}

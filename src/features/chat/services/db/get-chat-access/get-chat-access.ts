"use server";

import { cacheTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { WithChatId } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

type GetChatAccessProps = WithChatId & WithUserId;

export async function getChatAccess({ chatId, userId }: GetChatAccessProps) {
    "use cache";
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    cacheTag(tag.chatVisibility(chatId));

    const { data: chat } = await supabase
        .from("chats")
        .select("id, visibility, userId")
        .eq("id", chatId)
        .or(`visibility.eq.public,visibility.eq.private`)
        .maybeSingle();

    const chatFound = !!chat;

    if (!chatFound) {
        return {
            allowed: false,
            chatFound: false,
            isOwner: false,
            isPrivate: false,
            isPublic: false,
        };
    }

    const isOwner = chat.userId === userId;
    const isPrivate = chat.visibility === CHAT_VISIBILITY.PRIVATE;
    const isPublic = chat.visibility === CHAT_VISIBILITY.PUBLIC;

    if (isOwner) {
        return {
            allowed: true,
            visibility: chat.visibility,
            chatFound,
            isOwner,
            isPrivate,
            isPublic,
        };
    }

    if (isPrivate && !isOwner) {
        return {
            allowed: false,
            visibility: chat.visibility,
            chatFound,
            isOwner,
            isPrivate,
            isPublic,
        };
    }

    if (isPublic && !isOwner) {
        return {
            allowed: true,
            visibility: chat.visibility,
            chatFound,
            isOwner,
            isPrivate,
            isPublic,
        };
    }

    throw new Error("Invalid chat visibility state");
}

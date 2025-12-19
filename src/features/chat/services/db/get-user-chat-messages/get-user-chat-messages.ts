"use server";

import { unstable_cacheTag as cacheTag } from "next/cache";

import type {
    WithChatId,
    WithOptionalVerifyChatAccess,
} from "@/features/chat/lib/types";
import { uncachedGetUserChatMessages } from "@/features/chat/services/db/uncached-get-user-chat-messages";

import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

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

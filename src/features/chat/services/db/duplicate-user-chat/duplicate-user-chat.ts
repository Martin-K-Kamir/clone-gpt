"use server";

import { revalidateTag } from "next/cache";

import { assertIsDBChatId } from "@/features/chat/lib/asserts";
import type {
    DBChat,
    WithChatId,
    WithNewChatId,
} from "@/features/chat/lib/types";
import { duplicateMessages } from "@/features/chat/lib/utils";
import { createUserChat } from "@/features/chat/services/db/create-user-chat";
import { getUserChatById } from "@/features/chat/services/db/get-user-chat-by-id";
import { storeUserChatMessages } from "@/features/chat/services/db/store-user-chat-messages";
import { uncachedGetUserChatMessages } from "@/features/chat/services/db/uncached-get-user-chat-messages";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";
import type { WithOptionalThrowOnNotFound } from "@/lib/types";

type DuplicateUserChatProps = WithNewChatId &
    WithChatId &
    WithUserId &
    WithOptionalThrowOnNotFound;

export async function duplicateUserChat({
    newChatId,
    chatId,
    userId,
    throwOnNotFound = true,
}: DuplicateUserChatProps) {
    assertIsDBChatId(chatId);
    assertIsDBChatId(newChatId);
    assertIsDBUserId(userId);

    const originalChat = await getUserChatById({
        chatId,
        userId,
        throwOnNotFound,
        verifyChatAccess: false,
    });

    if (!originalChat) return null;

    const { data: originalMessages } = await uncachedGetUserChatMessages({
        chatId,
        userId,
        verifyChatAccess: false,
    });

    const newChat = await createUserChat({
        userId,
        throwOnNotFound,
        title: originalChat.title,
        chatId: newChatId,
    });

    if (originalMessages?.length) {
        const duplicatedMessages = await duplicateMessages({
            userId,
            newChatId,
            messages: originalMessages,
        });

        await storeUserChatMessages({
            userId,
            chatId: newChatId,
            messages: duplicatedMessages,
            preserveCreatedAt: true,
        });
    }

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
    revalidateTag(tag.userInitialChatsSearch(userId));

    return newChat as DBChat;
}

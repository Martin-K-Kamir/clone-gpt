"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsChatVisibility,
    assertIsDBChatIds,
} from "@/features/chat/lib/asserts";
import type {
    DBChat,
    WithChatIds,
    WithVisibility,
} from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function updateManyChatsVisibility({
    visibility,
    chatIds,
}: WithVisibility & WithChatIds) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsChatVisibility(visibility);
        assertIsDBChatIds(chatIds);

        const { data, error } = await supabase
            .from("chats")
            .update({ visibility, visibleAt: new Date().toISOString() })
            .eq("userId", userId)
            .in("id", chatIds)
            .select("*");

        if (error) throw new Error("Failed to update chat visibility");

        updateTag(tag.userChats(userId));
        updateTag(tag.userSharedChats(userId));
        updateTag(tag.userChatsSearch(userId));
        chatIds.forEach(chatId => {
            updateTag(tag.chatVisibility(chatId));
        });

        return api.success.chat.visibility(data as DBChat[], {
            visibility,
            count: PLURAL.MULTIPLE,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.visibility(error, {
                visibility,
                count: PLURAL.MULTIPLE,
            }),
        );
    }
}

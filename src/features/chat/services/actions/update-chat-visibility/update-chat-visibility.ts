"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import {
    assertIsChatVisibility,
    assertIsDBChatId,
} from "@/features/chat/lib/asserts";
import type { WithChatId, WithVisibility } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

type UpdateChatVisibilityProps = WithChatId & WithVisibility;

export async function updateChatVisibility({
    chatId,
    visibility,
}: UpdateChatVisibilityProps) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsDBChatId(chatId);
        assertIsChatVisibility(visibility);

        const { data, error } = await supabase
            .from("chats")
            .update({ visibility, visibleAt: new Date().toISOString() })
            .eq("id", chatId)
            .eq("userId", userId)
            .select("visibility")
            .single();

        if (error) throw new Error("Failed to update chat visibility");

        updateTag(tag.userChat(chatId));
        updateTag(tag.userChats(userId));
        updateTag(tag.chatVisibility(chatId));
        updateTag(tag.userSharedChats(userId));

        return api.success.chat.visibility(data.visibility, {
            count: PLURAL.SINGLE,
            visibility,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.visibility(error, {
                visibility,
                count: PLURAL.SINGLE,
            }),
        );
    }
}

"use server";

import { updateTag } from "next/cache";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { assertIsChatVisibility } from "@/features/chat/lib/asserts";
import type { WithVisibility } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

import { supabase } from "@/services/supabase";

export async function setAllUserChatsVisibility({
    visibility,
}: WithVisibility) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;
        assertIsDBUserId(userId);
        assertIsChatVisibility(visibility);

        const { error } = await supabase
            .from("chats")
            .update({ visibility, visibleAt: new Date().toISOString() })
            .eq("userId", userId);

        if (error) throw new Error("Failed to set all chats visibility");

        updateTag(tag.userChats(userId));
        updateTag(tag.userSharedChats(userId));
        updateTag(tag.userChatsSearch(userId));

        return api.success.chat.visibility(undefined, {
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

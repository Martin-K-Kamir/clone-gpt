"use server";

import { revalidateTag } from "next/cache";

import { assertIsChatVisibility } from "@/features/chat/lib/asserts";
import type { WithVisibility } from "@/features/chat/lib/types";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";

import { supabase } from "@/services/supabase";

type SetAllUserChatsVisibilityProps = WithVisibility & WithUserId;

export async function setAllUserChatsVisibility({
    visibility,
    userId,
}: SetAllUserChatsVisibilityProps) {
    assertIsDBUserId(userId);
    assertIsChatVisibility(visibility);

    const { error } = await supabase
        .from("chats")
        .update({ visibility, visibleAt: new Date().toISOString() })
        .eq("userId", userId);

    if (error) throw new Error("Failed to set all chats visibility");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
}

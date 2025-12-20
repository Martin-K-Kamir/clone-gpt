"use server";

import { cacheTag } from "next/cache";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserChatPreferences,
    WithUserId,
} from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

export async function getUserChatPreferences({ userId }: WithUserId) {
    "use cache";
    assertIsDBUserId(userId);
    cacheTag(tag.userChatPreferences(userId));

    const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("userId", userId)
        .single();

    return data as DBUserChatPreferences | null;
}

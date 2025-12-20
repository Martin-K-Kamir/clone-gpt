"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserMessagesRateLimit,
    WithUserId,
} from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export async function getUserMessagesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_messages_rate_limits")
        .select("*")
        .eq("userId", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
    }

    return data as DBUserMessagesRateLimit | null;
}

"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserMessagesRateLimit,
    WithUserId,
} from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export async function createUserMessagesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_messages_rate_limits")
        .insert([
            {
                userId,
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
            },
        ])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserMessagesRateLimit | null;
}

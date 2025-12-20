"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserMessagesRateLimit,
    WithUserId,
} from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

type UpdateUserMessagesRateLimitProps = {
    updates: Partial<
        Omit<DBUserMessagesRateLimit, "id" | "userId" | "createdAt">
    >;
} & WithUserId;

export async function updateUserMessagesRateLimit({
    userId,
    updates,
}: UpdateUserMessagesRateLimitProps) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_messages_rate_limits")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("userId", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserMessagesRateLimit | null;
}

"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserFilesRateLimit,
    WithUserId,
} from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

type UpdateUserFilesRateLimitProps = {
    updates: Partial<Omit<DBUserFilesRateLimit, "id" | "userId" | "createdAt">>;
} & WithUserId;

export async function updateUserFilesRateLimit({
    userId,
    updates,
}: UpdateUserFilesRateLimitProps) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_files_rate_limits")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("userId", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserFilesRateLimit | null;
}

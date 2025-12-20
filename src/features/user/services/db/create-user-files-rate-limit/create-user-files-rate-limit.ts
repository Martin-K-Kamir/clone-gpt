"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserFilesRateLimit,
    WithUserId,
} from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export async function createUserFilesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_files_rate_limits")
        .insert([
            {
                userId,
                filesCounter: 0,
                isOverLimit: false,
            },
        ])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserFilesRateLimit | null;
}

"use server";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type {
    DBUserFilesRateLimit,
    WithUserId,
} from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export async function getUserFilesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_files_rate_limits")
        .select("*")
        .eq("userId", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
    }

    return data as DBUserFilesRateLimit | null;
}

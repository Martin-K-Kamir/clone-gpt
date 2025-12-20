"use server";

import { cacheTag } from "next/cache";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { DBUser, WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

export async function getUserById({ userId }: WithUserId) {
    "use cache";
    assertIsDBUserId(userId);
    cacheTag(tag.user(userId));

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        throw new Error("Failed to fetch user by ID");
    }

    return data as DBUser | null;
}

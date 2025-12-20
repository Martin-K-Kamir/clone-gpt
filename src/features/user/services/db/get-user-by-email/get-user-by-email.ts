"use server";

import type { DBUser, WithEmail } from "@/features/user/lib/types";

import { assertIsEmail } from "@/lib/asserts";

import { supabase } from "@/services/supabase";

export async function getUserByEmail({ email }: WithEmail) {
    assertIsEmail(email);

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error("Failed to fetch user by email");
    }

    return data as DBUser | null;
}

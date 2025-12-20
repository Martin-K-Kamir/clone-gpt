"use server";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUser } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export async function createGuestUser() {
    const { data, error } = await supabase
        .from("users")
        .insert([
            {
                name: "Guest",
                email: `guest-${crypto.randomUUID()}@example.com`,
                role: USER_ROLE.GUEST,
            },
        ])
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUser;
}

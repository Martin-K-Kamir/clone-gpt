"use server";

import { assertIsNewUser } from "@/features/user/lib/asserts";
import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUser, NewUser } from "@/features/user/lib/types";

import { supabase } from "@/services/supabase";

export async function createUser(newUser: NewUser) {
    assertIsNewUser(newUser);

    const { data, error } = await supabase
        .from("users")
        .insert([
            {
                ...newUser,
                role: newUser.role || USER_ROLE.USER,
            },
        ])
        .select("*")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUser | null;
}

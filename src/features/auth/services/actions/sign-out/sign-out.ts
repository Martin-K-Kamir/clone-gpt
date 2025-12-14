"use server";

import { signOut as _signOut } from "@/features/auth/services/auth";

export async function signOut(redirectTo = "/logout") {
    await _signOut({
        redirectTo,
        redirect: true,
    });
}

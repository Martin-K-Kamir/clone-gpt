"use server";

import type { AuthExternalProvider } from "@/features/auth/lib/types";
import { signIn as _signIn } from "@/features/auth/services/auth";

export async function signIn({
    provider,
    redirectTo = "/",
}: {
    provider: AuthExternalProvider;
    redirectTo?: string;
}) {
    await _signIn(provider, {
        redirectTo,
    });
}

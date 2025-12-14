"use server";

import { AuthError } from "next-auth";

import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import { signIn as _signIn } from "@/features/auth/services/auth";

import { api } from "@/lib/api-response";

export async function signInWithCredentials({
    email,
    password,
    redirectTo = "/",
}: {
    email: string;
    password: string;
    redirectTo?: string;
}) {
    try {
        await _signIn(AUTH_PROVIDER.CREDENTIALS, {
            redirectTo,
            email,
            password,
        });

        return api.success.auth.signin(null);
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof error.digest === "string" &&
            error.digest.includes("NEXT_REDIRECT")
        ) {
            return api.success.auth.signin(null);
        }

        if (error instanceof AuthError && error.type === "CredentialsSignin") {
            return api.error.auth.validation(error);
        }

        return api.error.auth.general(error);
    }
}

"use server";

import { AuthError } from "next-auth";

import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import { signupSchema } from "@/features/auth/lib/schemas";
import type { AuthExternalProvider } from "@/features/auth/lib/types";
import { hashPassword } from "@/features/auth/lib/utils/hash-password";
import {
    signIn as _signIn,
    signOut as _signOut,
} from "@/features/auth/services/auth";
import { createUser, getUserByEmail } from "@/features/user/services/db";
import { api } from "@/lib/api-response";

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

export async function signOut(redirectTo = "/logout") {
    await _signOut({
        redirectTo,
        redirect: true,
    });
}

export async function signUp(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}) {
    try {
        const validatedData = signupSchema.safeParse(data);

        if (!validatedData.success) {
            return api.error.auth.validation(validatedData.error);
        }

        const { email, name, password } = validatedData.data;

        const existingUser = await getUserByEmail({
            email,
        });

        if (existingUser) {
            return api.error.auth.emailExists(email);
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await createUser({
            email,
            name,
            password: hashedPassword,
        });

        if (!newUser) {
            return api.error.auth.general();
        }

        return api.success.auth.signup({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            image: newUser.image,
            role: newUser.role,
        });
    } catch (error) {
        return api.error.auth.general(error);
    }
}

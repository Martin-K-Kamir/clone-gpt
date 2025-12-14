"use server";

import { signupSchema } from "@/features/auth/lib/schemas";
import { hashPassword } from "@/features/auth/lib/utils/hash-password";

import { createUser, getUserByEmail } from "@/features/user/services/db";

import { api } from "@/lib/api-response";

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

import z from "zod";

import {
    MIN_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
} from "@/features/auth/lib/constants";

export const sessionSchema = z.object({
    user: z.object({
        id: z.string().uuid(),
        name: z.string(),
        image: z.string().nullable().optional(),
    }),
});

export const signinSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(
            MIN_PASSWORD_LENGTH,
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        ),
});

export const signupSchema = z
    .object({
        email: z.string().email(),
        name: z
            .string()
            .min(
                MIN_NAME_LENGTH,
                `Name must be at least ${MIN_NAME_LENGTH} characters`,
            ),
        password: z
            .string()
            .min(
                MIN_PASSWORD_LENGTH,
                `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
            ),
        confirmPassword: z
            .string()
            .min(
                MIN_PASSWORD_LENGTH,
                `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
            ),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

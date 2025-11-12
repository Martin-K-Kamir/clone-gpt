import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import { signinSchema } from "@/features/auth/lib/schemas";
import { comparePassword } from "@/features/auth/lib/utils/compare-password";
import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId, DBUserRole } from "@/features/user/lib/types";
import {
    createGuestUser,
    createUser,
    getUserByEmail,
} from "@/features/user/services/db";

declare module "next-auth" {
    interface Session {
        user: {
            id: DBUserId;
            name: string;
            email: string;
            image?: string;
            role: DBUserRole;
        };
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_AUTH_ID,
            clientSecret: process.env.GOOGLE_AUTH_SECRET,
        }),
        GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            authorization: {
                params: {
                    scope: "read:user user:email",
                },
            },
        }),
        Credentials({
            id: AUTH_PROVIDER.CREDENTIALS,
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async credentials => {
                try {
                    const validatedData = signinSchema.parse(credentials);

                    const user = await getUserByEmail({
                        email: validatedData.email,
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordValid = await comparePassword(
                        validatedData.password,
                        user.password,
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                    };
                } catch {
                    return null;
                }
            },
        }),
        Credentials({
            id: AUTH_PROVIDER.GUEST,
            credentials: {},
            authorize: async () => {
                const guestUser = await createGuestUser();
                return guestUser;
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                // @ts-expect-error role exists on DBUser but not on NextAuth User type
                token.role = user.role;
            }
            return token;
        },
        signIn: async ({ user, account }) => {
            try {
                if (
                    account?.provider === AUTH_PROVIDER.GUEST ||
                    account?.provider === AUTH_PROVIDER.CREDENTIALS
                ) {
                    return true;
                }

                if (user.email == null || user.name == null) {
                    return false;
                }

                const existingUser = await getUserByEmail({
                    email: user.email,
                });

                if (!existingUser) {
                    await createUser({
                        email: user.email,
                        name: user.name,
                        image: user.image ?? null,
                        role: USER_ROLE.USER,
                        password: null,
                    });
                }

                return true;
            } catch {
                return false;
            }
        },
        session: async ({ session, token }) => {
            if (token?.id && token?.role) {
                // @ts-expect-error when casting to DBUserId typescript complains that the type is a never
                session.user.id = token.id as undefined as DBUserId;
                // @ts-expect-error token.role is unknown but we know it's a valid DBUserRole
                session.user.role = token.role;

                // For guest users, fetch full user data from DB
                if (
                    typeof token.role === "string" &&
                    token.role === USER_ROLE.GUEST
                ) {
                    const existingUser = await getUserByEmail({
                        email: session.user?.email ?? "",
                    });
                    if (existingUser) {
                        session.user.name =
                            existingUser.name ?? session.user.name;
                        session.user.email =
                            existingUser.email ?? session.user.email;
                        session.user.image =
                            existingUser.image ?? session.user.image;
                    }
                }
            } else {
                const existingUser = await getUserByEmail({
                    email: session.user?.email ?? "",
                });

                if (existingUser) {
                    // @ts-expect-error when casting to DBUserId typescript complains that the type is a never
                    session.user.id = existingUser.id as undefined as DBUserId;
                    session.user.role = existingUser.role;
                    session.user.name = existingUser.name ?? session.user.name;
                    session.user.email =
                        existingUser.email ?? session.user.email;
                    session.user.image =
                        existingUser.image ?? session.user.image;
                }
            }

            return session;
        },
    },
});

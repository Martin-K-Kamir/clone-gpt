"use server";

import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

import {
    assertIsDBUserId,
    assertIsNewUser,
    assertIsUserChatPreferences,
    assertIsUserRole,
} from "@/features/user/lib/asserts";
import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type {
    DBUser,
    DBUserChatPreferences,
    DBUserFilesRateLimit,
    DBUserMessagesRateLimit,
    NewUser,
    UserEntitlements,
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
    WithEmail,
    WithPartialUserChatPreferences,
    WithUserId,
    WithUserRole,
} from "@/features/user/lib/types";

import { assertIsEmail, assertIsNonEmptyString } from "@/lib/asserts";
import { tag } from "@/lib/cache-tags";
import { RATE_LIMIT_REASON } from "@/lib/constants";
import type { RateLimitReason, WithNewName } from "@/lib/types";

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

export async function getUserById({ userId }: WithUserId) {
    "use cache";
    assertIsDBUserId(userId);
    cacheTag(tag.user(userId));

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        throw new Error("Failed to fetch user by ID");
    }

    return data as DBUser | null;
}

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

export async function updateUserName({
    userId,
    newName,
}: WithNewName & WithUserId) {
    assertIsDBUserId(userId);
    assertIsNonEmptyString(newName);

    const { data, error } = await supabase
        .from("users")
        .update({ name: newName })
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    revalidateTag(tag.user(userId));

    return data as DBUser | null;
}

export async function deleteUser({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { error: chatsError } = await supabase
        .from("messages")
        .delete()
        .eq("userId", userId);

    if (chatsError) {
        throw new Error(
            `Failed to delete user messages: ${chatsError.message}`,
        );
    }

    const { error: messagesError } = await supabase
        .from("chats")
        .delete()
        .eq("userId", userId);

    if (messagesError) {
        throw new Error(
            `Failed to delete user chats: ${messagesError.message}`,
        );
    }

    const { error: messagesRateLimitError } = await supabase
        .from("user_messages_rate_limits")
        .delete()
        .eq("userId", userId);

    if (messagesRateLimitError) {
        throw new Error(
            `Failed to delete user messages rate limit: ${messagesRateLimitError.message}`,
        );
    }

    const { error: filesRateLimitError } = await supabase
        .from("user_files_rate_limits")
        .delete()
        .eq("userId", userId);

    if (filesRateLimitError) {
        throw new Error(
            `Failed to delete user files rate limit: ${filesRateLimitError.message}`,
        );
    }

    const { error: preferencesError } = await supabase
        .from("user_preferences")
        .delete()
        .eq("userId", userId);

    if (preferencesError) {
        throw new Error(
            `Failed to delete user preferences: ${preferencesError.message}`,
        );
    }

    const { data, error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }

    revalidateTag(tag.user(userId));
    revalidateTag(tag.userChatPreferences(userId));

    return data as DBUser | null;
}

export async function getUserChatPreferences({ userId }: WithUserId) {
    "use cache";
    assertIsDBUserId(userId);
    cacheTag(tag.userChatPreferences(userId));

    const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("userId", userId)
        .single();

    return data as DBUserChatPreferences | null;
}

export async function upsertUserChatPreferences({
    userId,
    userChatPreferences,
}: WithUserId & WithPartialUserChatPreferences) {
    assertIsDBUserId(userId);
    assertIsUserChatPreferences(userChatPreferences);

    const { data, error } = await supabase
        .from("user_preferences")
        .upsert(
            {
                userId,
                ...userChatPreferences,
            },
            {
                onConflict: "userId",
                ignoreDuplicates: false,
            },
        )
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    revalidateTag(tag.userChatPreferences(userId));

    return data as DBUserChatPreferences | null;
}

export async function getUserMessagesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_messages_rate_limits")
        .select("*")
        .eq("userId", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
    }

    return data as DBUserMessagesRateLimit | null;
}

export async function createUserMessagesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_messages_rate_limits")
        .insert([
            {
                userId,
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
            },
        ])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserMessagesRateLimit | null;
}

export async function updateUserMessagesRateLimit({
    userId,
    updates,
}: {
    updates: Partial<
        Omit<DBUserMessagesRateLimit, "id" | "userId" | "createdAt">
    >;
} & WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_messages_rate_limits")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("userId", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserMessagesRateLimit | null;
}

export async function checkUserMessagesRateLimit({
    userId,
    userRole,
}: WithUserId & WithUserRole): Promise<UserMessagesRateLimitResult> {
    assertIsDBUserId(userId);
    if (userRole) {
        assertIsUserRole(userRole);
    }

    let role = userRole;

    if (!role) {
        const user = await getUserById({ userId });
        if (!user) {
            throw new Error("User not found");
        }
        role = user.role;
    }

    const entitlements = entitlementsByUserRole[role];

    let rateLimit = await getUserMessagesRateLimit({ userId });
    if (!rateLimit) {
        rateLimit = await createUserMessagesRateLimit({ userId });
    }

    if (!rateLimit) {
        throw new Error("Failed to create user messages rate limit record");
    }
    const getRateLimitReason = (
        rateLimit: DBUserMessagesRateLimit,
        entitlements: UserEntitlements,
    ) => {
        if (rateLimit.messagesCounter >= entitlements.maxMessages) {
            return RATE_LIMIT_REASON.MESSAGES;
        }
        if (rateLimit.tokensCounter >= entitlements.maxTokens) {
            return RATE_LIMIT_REASON.TOKENS;
        }
        throw new Error("No rate limit reason found");
    };

    const now = new Date();
    const lastUpdate = new Date(rateLimit.updatedAt);
    const hoursSinceLastUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastUpdate >= 24) {
        await updateUserMessagesRateLimit({
            userId,
            updates: {
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
            },
        });
        return {
            isOverLimit: false,
            messagesCounter: rateLimit.messagesCounter,
            tokensCounter: rateLimit.tokensCounter,
        };
    }

    if (rateLimit.isOverLimit && rateLimit.periodEnd && rateLimit.periodStart) {
        const now = new Date();
        const periodEnd = new Date(rateLimit.periodEnd);

        if (now < periodEnd) {
            return {
                isOverLimit: true,
                reason: getRateLimitReason(rateLimit, entitlements),
                periodEnd: rateLimit.periodEnd,
                periodStart: rateLimit.periodStart,
                messagesCounter: rateLimit.messagesCounter,
                tokensCounter: rateLimit.tokensCounter,
            };
        } else {
            await updateUserMessagesRateLimit({
                userId,
                updates: {
                    messagesCounter: 0,
                    tokensCounter: 0,
                    isOverLimit: false,
                    periodStart: null,
                    periodEnd: null,
                },
            });
            return {
                isOverLimit: false,
                messagesCounter: rateLimit.messagesCounter,
                tokensCounter: rateLimit.tokensCounter,
            };
        }
    }

    const handleLimitExceeded = async (
        reason: RateLimitReason,
    ): Promise<UserMessagesRateLimitResult> => {
        const now = new Date();
        now.setSeconds(0, 0);
        const periodStart = now.toISOString();

        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const periodEnd = end.toISOString();

        await updateUserMessagesRateLimit({
            userId,
            updates: {
                isOverLimit: true,
                periodStart,
                periodEnd,
            },
        });

        return {
            isOverLimit: true,
            reason,
            periodStart,
            periodEnd,
            messagesCounter: rateLimit.messagesCounter,
            tokensCounter: rateLimit.tokensCounter,
        };
    };

    if (rateLimit.tokensCounter >= entitlements.maxTokens) {
        return handleLimitExceeded(RATE_LIMIT_REASON.TOKENS);
    }

    if (rateLimit.messagesCounter >= entitlements.maxMessages) {
        return handleLimitExceeded(RATE_LIMIT_REASON.MESSAGES);
    }

    return {
        isOverLimit: false,
        messagesCounter: rateLimit.messagesCounter,
        tokensCounter: rateLimit.tokensCounter,
    };
}

export async function incrementUserMessagesRateLimit({
    userId,
    increments,
}: { increments: { messages?: number; tokens?: number } } & WithUserId) {
    assertIsDBUserId(userId);

    const rateLimit = await getUserMessagesRateLimit({ userId });
    if (!rateLimit) {
        await createUserMessagesRateLimit({ userId });
    }

    const currentRateLimit = rateLimit || {
        messagesCounter: 0,
        tokensCounter: 0,
    };

    await updateUserMessagesRateLimit({
        userId,
        updates: {
            messagesCounter:
                currentRateLimit.messagesCounter + (increments.messages || 0),
            tokensCounter:
                currentRateLimit.tokensCounter + (increments.tokens || 0),
        },
    });
}

export async function getUserFilesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_files_rate_limits")
        .select("*")
        .eq("userId", userId)
        .single();

    if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
    }

    return data as DBUserFilesRateLimit | null;
}

export async function createUserFilesRateLimit({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_files_rate_limits")
        .insert([
            {
                userId,
                filesCounter: 0,
                isOverLimit: false,
            },
        ])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserFilesRateLimit | null;
}

export async function updateUserFilesRateLimit({
    userId,
    updates,
}: {
    updates: Partial<Omit<DBUserFilesRateLimit, "id" | "userId" | "createdAt">>;
} & WithUserId) {
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("user_files_rate_limits")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("userId", userId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as DBUserFilesRateLimit | null;
}

export async function checkUserFilesRateLimit({
    userId,
    userRole,
}: WithUserId & WithUserRole): Promise<UserFilesRateLimitResult> {
    assertIsDBUserId(userId);
    if (userRole) {
        assertIsUserRole(userRole);
    }
    let role = userRole;

    if (!role) {
        const user = await getUserById({ userId });
        if (!user) {
            throw new Error("User not found");
        }
        role = user.role;
    }

    const entitlements = entitlementsByUserRole[role];

    let rateLimit = await getUserFilesRateLimit({ userId });
    if (!rateLimit) {
        rateLimit = await createUserFilesRateLimit({ userId });
    }

    if (!rateLimit) {
        throw new Error("Failed to create user files rate limit record");
    }

    const now = new Date();
    const lastUpdate = new Date(rateLimit.updatedAt);
    const hoursSinceLastUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastUpdate >= 24) {
        await updateUserFilesRateLimit({
            userId,
            updates: {
                filesCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
            },
        });
        return { isOverLimit: false, filesCounter: rateLimit.filesCounter };
    }

    if (rateLimit.isOverLimit && rateLimit.periodEnd && rateLimit.periodStart) {
        const now = new Date();
        const periodEnd = new Date(rateLimit.periodEnd);

        if (now < periodEnd) {
            return {
                isOverLimit: true,
                reason: RATE_LIMIT_REASON.FILES,
                periodEnd: rateLimit.periodEnd,
                periodStart: rateLimit.periodStart,
                filesCounter: rateLimit.filesCounter,
            };
        } else {
            await updateUserFilesRateLimit({
                userId,
                updates: {
                    filesCounter: 0,
                    isOverLimit: false,
                    periodStart: null,
                    periodEnd: null,
                },
            });
            return { isOverLimit: false, filesCounter: rateLimit.filesCounter };
        }
    }

    if (rateLimit.filesCounter >= entitlements.maxFiles) {
        const now = new Date();
        now.setSeconds(0, 0);
        const periodStart = now.toISOString();

        const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const periodEnd = end.toISOString();

        await updateUserFilesRateLimit({
            userId,
            updates: {
                isOverLimit: true,
                periodStart,
                periodEnd,
            },
        });

        return {
            isOverLimit: true,
            reason: RATE_LIMIT_REASON.FILES,
            periodStart,
            periodEnd,
            filesCounter: rateLimit.filesCounter,
        };
    }

    return { isOverLimit: false, filesCounter: rateLimit.filesCounter };
}

export async function incrementUserFilesRateLimit({
    userId,
    increments,
}: { increments: { files?: number } } & WithUserId) {
    assertIsDBUserId(userId);

    const rateLimit = await getUserFilesRateLimit({ userId });
    if (!rateLimit) {
        await createUserFilesRateLimit({ userId });
    }

    const currentRateLimit = rateLimit || {
        filesCounter: 0,
    };

    await updateUserFilesRateLimit({
        userId,
        updates: {
            filesCounter:
                currentRateLimit.filesCounter + (increments.files || 0),
        },
    });
}

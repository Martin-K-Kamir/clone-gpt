import { z } from "zod";

import {
    userChatPreferenceSchema,
    userRoleSchema,
} from "@/features/user/lib/schemas";
import type {
    DBUserChatPreferences,
    DBUserId,
    DBUserRole,
    NewUser,
} from "@/features/user/lib/types";
import { AssertError } from "@/lib/classes";

export function assertIsDBUserId(
    value: unknown,
    message = "Invalid userId",
): asserts value is DBUserId {
    const schema = z.string().uuid();
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsNewUser(
    value: unknown,
    message = "Invalid new user",
): asserts value is NewUser {
    const schema = z.object({
        email: z.string().email(),
        name: z.string().min(1),
    });

    const result = schema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsUserChatPreferences(
    value: unknown,
    message = "Invalid partial user chat preferences",
): asserts value is Partial<DBUserChatPreferences> {
    const result = userChatPreferenceSchema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

export function assertIsUserRole(
    value: unknown,
    message = "Invalid user role",
): asserts value is DBUserRole {
    const result = userRoleSchema.safeParse(value);

    if (!result.success) {
        throw new AssertError({ message, issues: result.error.issues });
    }
}

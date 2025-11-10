import type {
    DBUserRole,
    UserEntitlementLimit,
} from "@/features/user/lib/types";

export const entitlementsByUserRole = {
    guest: {
        maxTokens: Number(process.env.CHAT_GUEST_ROLE_TOKENS_LIMIT),
        maxMessages: Number(process.env.CHAT_GUEST_ROLE_MESSAGES_LIMIT),
        maxFiles: Number(process.env.CHAT_GUEST_ROLE_FILES_LIMIT),
    },
    user: {
        maxTokens: Number(process.env.CHAT_USER_ROLE_TOKENS_LIMIT!),
        maxMessages: Number(process.env.CHAT_USER_ROLE_MESSAGES_LIMIT!),
        maxFiles: Number(process.env.CHAT_USER_ROLE_FILES_LIMIT!),
    },
    admin: {
        maxTokens: Number(process.env.CHAT_ADMIN_ROLE_TOKENS_LIMIT),
        maxMessages: Number(process.env.CHAT_ADMIN_ROLE_MESSAGES_LIMIT),
        maxFiles: Number(process.env.CHAT_ADMIN_ROLE_FILES_LIMIT),
    },
} as const satisfies Record<DBUserRole, Record<UserEntitlementLimit, number>>;

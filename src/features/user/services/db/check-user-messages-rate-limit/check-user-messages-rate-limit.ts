"use server";

import {
    assertIsDBUserId,
    assertIsUserRole,
} from "@/features/user/lib/asserts";
import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import type {
    DBUserMessagesRateLimit,
    UserEntitlements,
    UserMessagesRateLimitResult,
    WithUserId,
    WithUserRole,
} from "@/features/user/lib/types";
import { createUserMessagesRateLimit } from "@/features/user/services/db/create-user-messages-rate-limit";
import { getUserById } from "@/features/user/services/db/get-user-by-id";
import { getUserMessagesRateLimit } from "@/features/user/services/db/get-user-messages-rate-limit";
import { updateUserMessagesRateLimit } from "@/features/user/services/db/update-user-messages-rate-limit";

import { RATE_LIMIT_REASON } from "@/lib/constants";
import type { RateLimitReason } from "@/lib/types";

type CheckUserMessagesRateLimitProps = WithUserId & WithUserRole;

export async function checkUserMessagesRateLimit({
    userId,
    userRole,
}: CheckUserMessagesRateLimitProps): Promise<UserMessagesRateLimitResult> {
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

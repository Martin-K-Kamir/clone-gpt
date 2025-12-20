"use server";

import {
    assertIsDBUserId,
    assertIsUserRole,
} from "@/features/user/lib/asserts";
import { entitlementsByUserRole } from "@/features/user/lib/constants/entitlements";
import type {
    UserFilesRateLimitResult,
    WithUserId,
    WithUserRole,
} from "@/features/user/lib/types";
import { createUserFilesRateLimit } from "@/features/user/services/db/create-user-files-rate-limit";
import { getUserById } from "@/features/user/services/db/get-user-by-id";
import { getUserFilesRateLimit } from "@/features/user/services/db/get-user-files-rate-limit";
import { updateUserFilesRateLimit } from "@/features/user/services/db/update-user-files-rate-limit";

import { RATE_LIMIT_REASON } from "@/lib/constants";

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

"use client";

import type {
    DBUserId,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
import { checkUserMessagesRateLimit } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tag";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { useRateLimit } from "@/hooks";

type UseUserMessagesRateLimitProps = {
    userId: DBUserId;
    errorToSync?: Error;
    onLimitExceeded?: (result: UserMessagesRateLimitResult) => void;
    onLimitAvailable?: (result: UserMessagesRateLimitResult) => void;
    onPeriodReset?: () => void;
};

export function useUserMessagesRateLimit({
    userId,
    errorToSync,
    onLimitExceeded,
    onLimitAvailable,
    onPeriodReset,
}: UseUserMessagesRateLimitProps) {
    return useRateLimit({
        queryKey: [tag.userMessagesRateLimit(userId)],
        queryFn: checkUserMessagesRateLimit,
        reasons: [RATE_LIMIT_REASON.MESSAGES, RATE_LIMIT_REASON.TOKENS],
        errorToSync,
        onLimitExceeded,
        onLimitAvailable,
        onPeriodReset,
    });
}

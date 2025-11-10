"use client";

import type {
    DBUserId,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
import { checkUserMessagesRateLimit } from "@/features/user/services/api";
import { useRateLimit } from "@/hooks";
import { tag } from "@/lib/cache-tags";
import { RATE_LIMIT_REASON } from "@/lib/constants";

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

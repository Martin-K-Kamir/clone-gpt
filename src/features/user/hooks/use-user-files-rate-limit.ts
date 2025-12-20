"use client";

import type {
    DBUserId,
    UserFilesRateLimitResult,
} from "@/features/user/lib/types";
import { checkUserFilesRateLimit } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tag";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { useRateLimit } from "@/hooks";

type UseUserFilesRateLimitProps = {
    userId: DBUserId;
    errorToSync?: Error;
    onLimitExceeded?: (result: UserFilesRateLimitResult) => void;
    onLimitAvailable?: (result: UserFilesRateLimitResult) => void;
    onPeriodReset?: () => void;
};

export function useUserFilesRateLimit({
    userId,
    errorToSync,
    onLimitExceeded,
    onLimitAvailable,
    onPeriodReset,
}: UseUserFilesRateLimitProps) {
    return useRateLimit({
        queryKey: [tag.userFilesRateLimit(userId)],
        queryFn: checkUserFilesRateLimit,
        reasons: [RATE_LIMIT_REASON.FILES],
        errorToSync,
        onLimitExceeded,
        onLimitAvailable,
        onPeriodReset,
    });
}

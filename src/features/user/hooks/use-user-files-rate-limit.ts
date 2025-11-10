"use client";

import type {
    DBUserId,
    UserFilesRateLimitResult,
} from "@/features/user/lib/types";
import { checkUserFilesRateLimit } from "@/features/user/services/api";
import { useRateLimit } from "@/hooks";
import { tag } from "@/lib/cache-tags";
import { RATE_LIMIT_REASON } from "@/lib/constants";

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

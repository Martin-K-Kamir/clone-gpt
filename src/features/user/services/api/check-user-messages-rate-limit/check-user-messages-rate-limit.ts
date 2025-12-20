import type { UserMessagesRateLimitResult } from "@/features/user/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/classes";
import { HttpErrorStatus } from "@/lib/types";

export async function checkUserMessagesRateLimit(): Promise<UserMessagesRateLimitResult> {
    const response = await fetch("/api/user/messages-rate-limit");

    if (!response.ok) {
        throw new ApiError(
            "Failed to check user messages rate limit",
            response.status as HttpErrorStatus,
        );
    }

    const result =
        (await response.json()) as ApiResponse<UserMessagesRateLimitResult>;

    if (!result.success) {
        throw new ApiError(result.message, result.status);
    }

    return result.data;
}

import type { UserFilesRateLimitResult } from "@/features/user/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/classes";
import { HttpErrorStatus } from "@/lib/types";

export async function checkUserFilesRateLimit(): Promise<UserFilesRateLimitResult> {
    const response = await fetch("/api/user/files-rate-limit");

    if (!response.ok) {
        throw new ApiError(
            "Failed to check user files rate limit",
            response.status as HttpErrorStatus,
        );
    }

    const result =
        (await response.json()) as ApiResponse<UserFilesRateLimitResult>;

    if (!result.success) {
        throw new ApiError(result.message, result.status);
    }

    return result.data;
}

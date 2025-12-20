import type { DBUser } from "@/features/user/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/classes";
import { HttpErrorStatus } from "@/lib/types";

export async function getUser(): Promise<DBUser> {
    const response = await fetch("/api/user");

    if (!response.ok) {
        throw new ApiError(
            "Failed to fetch user",
            response.status as HttpErrorStatus,
        );
    }

    const result = (await response.json()) as ApiResponse<DBUser>;

    if (!result.success) {
        throw new ApiError(result.message, result.status);
    }

    return result.data;
}

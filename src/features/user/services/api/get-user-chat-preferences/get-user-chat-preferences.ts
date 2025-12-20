import type { DBUserChatPreferences } from "@/features/user/lib/types";

import type { ApiResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/classes";
import { HttpErrorStatus } from "@/lib/types";

export async function getUserChatPreferences(): Promise<DBUserChatPreferences> {
    const response = await fetch("/api/user/chat-preferences");

    if (!response.ok) {
        throw new ApiError(
            "Failed to fetch user chat preferences",
            response.status as HttpErrorStatus,
        );
    }

    const result =
        (await response.json()) as ApiResponse<DBUserChatPreferences>;

    if (!result.success) {
        throw new ApiError(result.message, result.status);
    }

    return result.data;
}

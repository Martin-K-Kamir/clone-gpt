import type {
    DBUser,
    DBUserChatPreferences,
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
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

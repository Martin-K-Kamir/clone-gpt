import { api } from "@/lib/api-response";
import { ApiError, RateLimitError } from "@/lib/classes";

export async function fetchWithErrorHandlers(
    input: RequestInfo | URL,
    init?: RequestInit,
) {
    try {
        const response = await fetch(input, init);

        if (!response.ok) {
            throw await response.json();
        }

        return response;
    } catch (error: unknown) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            throw api.error.chat.connection();
        }

        const instanceError = [
            RateLimitError.getInstance(error),
            ApiError.getInstance(error),
        ].find(Boolean);

        if (instanceError) {
            throw instanceError;
        }

        throw error;
    }
}

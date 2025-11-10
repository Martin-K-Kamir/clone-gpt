import {
    AuthorizationError,
    SessionInvalidError,
} from "@/features/auth/lib/classes";
import { ApiErrorResponse, api } from "@/lib/api-response";
import { AssertError } from "@/lib/classes";

export function handleApiError<TError = unknown>(
    error: TError,
    fallbackError: () => ApiErrorResponse<TError>,
): ApiErrorResponse<TError> {
    if (error instanceof AuthorizationError) {
        return api.error.session.authorization(error);
    }

    if (error instanceof SessionInvalidError) {
        return api.error.session.invalid(error);
    }

    if (error instanceof AssertError) {
        return api.error({
            message: error.message,
            error: error.error,
            status: error.status,
        }) as ApiErrorResponse<TError>;
    }

    return fallbackError();
}

export function handleApiErrorResponse<TError = unknown>(
    error: TError,
    fallbackError: () => Response,
): Response {
    if (error instanceof AuthorizationError) {
        return api.error.session.authorization(error).toResponse();
    }

    if (error instanceof SessionInvalidError) {
        return api.error.session.invalid(error).toResponse();
    }

    if (error instanceof AssertError) {
        return api
            .error({
                message: error.message,
                error: error.error,
                status: error.status,
            })
            .toResponse();
    }

    return fallbackError();
}

import { HTTP_ERROR_STATUS } from "@/lib/constants";

export class AuthorizationError extends Error {
    readonly kind = "authorization" as const;
    readonly status = HTTP_ERROR_STATUS.FORBIDDEN;

    constructor(
        message = "User does not have permission to access this resource",
    ) {
        super(message);
    }
}

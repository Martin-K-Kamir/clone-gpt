import { HTTP_ERROR_STATUS } from "@/lib/constants";

export class AuthenticationError extends Error {
    readonly kind = "authentication" as const;
    readonly status = HTTP_ERROR_STATUS.UNAUTHORIZED;

    constructor(message = "User is not authenticated") {
        super(message);
    }
}

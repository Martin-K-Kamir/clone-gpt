import z from "zod";

import { HTTP_ERROR_STATUS } from "@/lib/constants";

export class SessionInvalidError extends Error {
    readonly kind = "invalid_session" as const;
    readonly status = HTTP_ERROR_STATUS.BAD_REQUEST;
    readonly issues: z.ZodIssue[] | undefined;
    readonly error: string | undefined;

    constructor(
        options?: Partial<{
            message: string;
            issues: z.ZodIssue[];
            error: string;
        }>,
    ) {
        super(options?.message ?? "Session is not valid");

        this.issues = options?.issues;
        this.error =
            options?.error ??
            options?.issues?.map(issue => issue.message).join(", ") ??
            undefined;
    }
}

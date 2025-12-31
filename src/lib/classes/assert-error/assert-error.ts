import z from "zod";

import { HTTP_ERROR_STATUS } from "@/lib/constants/http";

type Options = Partial<{
    message: string;
    issues: z.ZodIssue[];
    error: string;
}>;

export const ASSERT_ERROR_KIND = "assert_error";

export class AssertError extends Error {
    readonly kind = ASSERT_ERROR_KIND;
    readonly status = HTTP_ERROR_STATUS.BAD_REQUEST;
    readonly issues: z.ZodIssue[] | undefined;
    readonly error: string | undefined;
    readonly name: string;

    constructor(options?: Options) {
        super(options?.message ?? "Invalid input data");

        this.issues = options?.issues;
        this.error =
            options?.error ??
            options?.issues?.map(issue => issue.message).join(", ") ??
            undefined;
        this.name = this.constructor.name;
    }

    static getKind() {
        return ASSERT_ERROR_KIND;
    }
}

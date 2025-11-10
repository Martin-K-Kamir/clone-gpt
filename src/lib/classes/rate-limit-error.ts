import z from "zod";

import { HTTP_ERROR_STATUS, RATE_LIMIT_REASON } from "@/lib/constants";
import type { RateLimitReason } from "@/lib/types";

export const RATE_LIMIT_ERROR = "rate_limit_error";

export class RateLimitError extends Error {
    readonly name: string;
    readonly reason: RateLimitReason;
    readonly periodStart: Date;
    readonly periodEnd: Date;
    readonly kind = RATE_LIMIT_ERROR;
    readonly status = HTTP_ERROR_STATUS.TOO_MANY_REQUESTS;

    constructor(
        message: string,
        reason: RateLimitReason,
        periodStart: Date | string,
        periodEnd: Date | string,
    ) {
        super(message);
        this.reason = reason;
        this.periodStart = new Date(periodStart);
        this.periodEnd = new Date(periodEnd);
        this.name = this.constructor.name;
    }

    static getKind() {
        return RATE_LIMIT_ERROR;
    }

    protected static schema() {
        return z.object({
            message: z.string(),
            status: z.literal(HTTP_ERROR_STATUS.TOO_MANY_REQUESTS),
            error: z.object({
                reason: z.nativeEnum(RATE_LIMIT_REASON),
                periodStart: z.string(),
                periodEnd: z.string(),
            }),
        });
    }

    static getInstance(error: unknown) {
        const result = this.schema().safeParse(error);

        if (result.success) {
            const { message, error } = result.data;

            return new RateLimitError(
                message,
                error.reason,
                error.periodStart,
                error.periodEnd,
            );
        }

        return null;
    }
}

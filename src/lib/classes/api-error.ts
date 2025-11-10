import z from "zod";

import { HTTP_ERROR_STATUS } from "@/lib/constants/http";
import type { HttpErrorStatus } from "@/lib/types";

export const API_ERROR_KIND = "api_error";

export class ApiError extends Error {
    readonly kind = API_ERROR_KIND;
    readonly status: HttpErrorStatus;
    readonly name: string;

    constructor(message: string, status: HttpErrorStatus) {
        super(message);

        this.message = message;
        this.status = status;
        this.name = this.constructor.name;
    }

    static getKind() {
        return API_ERROR_KIND;
    }

    protected static schema() {
        return z.object({
            message: z.string(),
            status: z.nativeEnum(HTTP_ERROR_STATUS),
        });
    }

    static getInstance(error: unknown) {
        const result = this.schema().safeParse(error);

        if (result.success) {
            return new ApiError(result.data.message, result.data.status);
        }

        return null;
    }
}

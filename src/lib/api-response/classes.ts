import type { HttpErrorStatus, HttpSuccessStatus } from "@/lib/types/types";

export abstract class ApiResponseBase {
    abstract readonly success: boolean;

    constructor(
        public readonly status: HttpSuccessStatus | HttpErrorStatus,
        public readonly path: string,
        public readonly message: string,
        public readonly timestamp: number = Date.now(),
    ) {}

    toJson(): string {
        return JSON.stringify(this);
    }

    toResponse(): Response {
        return Response.json(this, { status: this.status });
    }
}

export class ApiSuccessResponse<TData = unknown> extends ApiResponseBase {
    readonly success = true as const;

    constructor(
        status: HttpSuccessStatus,
        public readonly data: TData,
        path: string,
        message: string,
        timestamp?: number,
    ) {
        super(status, path, message, timestamp);
    }
}

export class ApiErrorResponse<TError = unknown> extends ApiResponseBase {
    readonly success = false as const;

    constructor(
        status: HttpErrorStatus,
        path: string,
        message: string,
        public readonly error?: TError,
        public readonly data?: unknown,
        timestamp?: number,
    ) {
        super(status, path, message, timestamp);
    }

    throw(CustomError?: new (message: string) => Error): never {
        if (!CustomError) {
            throw new ApiErrorResponse(
                this.status as HttpErrorStatus,
                this.path,
                this.message,
                this.error,
                this.data,
                this.timestamp,
            );
        }

        throw new CustomError(this.message);
    }
}

export type ApiSuccessResponseType<TData = unknown> = ApiSuccessResponse<TData>;
export type ApiErrorResponseType<TError = unknown> = ApiErrorResponse<TError>;

import type { HttpErrorStatus, HttpSuccessStatus } from "@/lib/types";

export type ApiResponseBase = {
    readonly path: string;
    readonly message: string;
    readonly timestamp: number;
    toJson(): string;
    toResponse(): Response;
};

export interface ApiSuccessResponse<TData = unknown> extends ApiResponseBase {
    readonly success: true;
    readonly status: HttpSuccessStatus;
    readonly data: TData;
    readonly timestamp: number;
}

export interface ApiErrorResponse<TError = unknown> extends ApiResponseBase {
    readonly success: false;
    readonly status: HttpErrorStatus;
    readonly error?: TError;
    readonly data?: unknown;
    readonly timestamp: number;
}

export type ApiResponse<TData = unknown, TError = unknown> =
    | ApiSuccessResponse<TData>
    | ApiErrorResponse<TError>;

function createResponseMethods<T extends { status: number }>(target: T) {
    return {
        toJson(): string {
            return JSON.stringify(target);
        },
        toResponse(): Response {
            return Response.json(target, { status: target.status });
        },
    };
}

// Proxy handler because we want to add methods to the response object while keeping it serializable
function createResponseProxyHandler<
    T extends Record<string, unknown> & { status: number },
>(target: T) {
    const methods = createResponseMethods(target);

    return {
        get(target: T, prop: string | symbol) {
            if (prop === "toJson") {
                return methods.toJson.bind(target);
            }
            if (prop === "toResponse") {
                return methods.toResponse.bind(target);
            }

            return target[prop as keyof T];
        },

        ownKeys(target: T) {
            return Object.keys(target);
        },

        has(target: T, prop: string | symbol) {
            return prop in target;
        },

        getOwnPropertyDescriptor(target: T, prop: string | symbol) {
            return Object.getOwnPropertyDescriptor(target, prop);
        },
    };
}

function CreateApiSuccessResponse<TData = unknown>(
    status: HttpSuccessStatus,
    data: TData,
    path: string,
    message: string,
    timestamp: number = Date.now(),
): ApiSuccessResponse<TData> {
    const responseData = {
        success: true as const,
        status,
        data,
        path,
        message,
        timestamp,
    };

    return new Proxy(
        responseData,
        createResponseProxyHandler(responseData),
    ) as ApiSuccessResponse<TData>;
}

export const createApiSuccessResponse = CreateApiSuccessResponse;

function CreateApiErrorResponse<TError = unknown>(
    status: HttpErrorStatus,
    path: string,
    message: string,
    error?: TError,
    data?: unknown,
    timestamp: number = Date.now(),
): ApiErrorResponse<TError> {
    const responseData = {
        success: false as const,
        status,
        path,
        message,
        error,
        data,
        timestamp,
    };

    return new Proxy(
        responseData,
        createResponseProxyHandler(responseData),
    ) as ApiErrorResponse<TError>;
}

export const createApiErrorResponse = CreateApiErrorResponse;

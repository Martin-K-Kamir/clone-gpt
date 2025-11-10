/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from "@/lib/constants";

import {
    type ApiErrorResponse,
    type ApiSuccessResponse,
    createApiErrorResponse,
    createApiSuccessResponse,
} from "./responses";
import type { ErrorConfig, SuccessConfig } from "./types";
import { formatMessage } from "./utils";

export function createErrorFactory<TMessages extends Record<string, any>>(
    messages: TMessages,
    parentPath = "",
): any {
    const result: Record<string, any> = {};

    for (const key in messages) {
        const value = messages[key];
        const currentPath = parentPath ? `${parentPath}.${key}` : key;

        if (typeof value === "string") {
            result[key] = <E = unknown>(
                error?: E,
                placeholders?: Record<string, string | number>,
            ) => {
                const finalMessage = formatMessage(value, placeholders);
                return createApiErrorResponse(
                    HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
                    currentPath,
                    finalMessage,
                    error,
                    undefined,
                    Date.now(),
                );
            };
        } else if (
            typeof value === "object" &&
            value !== null &&
            "message" in value &&
            "status" in value
        ) {
            result[key] = <E = unknown>(
                error?: E,
                placeholders?: Record<string, string | number>,
            ) => {
                const finalMessage = formatMessage(value.message, placeholders);
                return createApiErrorResponse(
                    value.status,
                    currentPath,
                    finalMessage,
                    error,
                    undefined,
                    Date.now(),
                );
            };
        } else {
            result[key] = createErrorFactory(
                value as Record<string, any>,
                currentPath,
            );
        }
    }

    return result;
}

export function createSuccessFactory<TMessages extends Record<string, any>>(
    messages: TMessages,
    parentPath = "",
): any {
    const result: Record<string, any> = {};

    for (const key in messages) {
        const value = messages[key];
        const currentPath = parentPath ? `${parentPath}.${key}` : key;

        if (typeof value === "string") {
            result[key] = <D = any>(
                data: D,
                placeholders?: Record<string, string | number>,
            ) => {
                const finalMessage = formatMessage(value, placeholders);
                return createApiSuccessResponse(
                    HTTP_SUCCESS_STATUS.OK,
                    data,
                    currentPath,
                    finalMessage,
                    Date.now(),
                );
            };
        } else if (
            typeof value === "object" &&
            value !== null &&
            "message" in value &&
            "status" in value
        ) {
            result[key] = <D = any>(
                data: D,
                placeholders?: Record<string, string | number>,
            ) => {
                const finalMessage = formatMessage(value.message, placeholders);
                return createApiSuccessResponse(
                    value.status,
                    data,
                    currentPath,
                    finalMessage,
                    Date.now(),
                );
            };
        } else {
            result[key] = createSuccessFactory(
                value as Record<string, any>,
                currentPath,
            );
        }
    }

    return result;
}

export function createCustomError(message: string): ApiErrorResponse<unknown>;
export function createCustomError<TError = unknown>(
    config: ErrorConfig<TError>,
): ApiErrorResponse<TError>;
export function createCustomError<TError = unknown>(
    messageOrConfig: string | ErrorConfig<TError>,
) {
    if (typeof messageOrConfig === "string") {
        return createApiErrorResponse(
            HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
            "custom",
            messageOrConfig,
            undefined,
            undefined,
            Date.now(),
        );
    }

    return createApiErrorResponse(
        messageOrConfig.status ?? HTTP_ERROR_STATUS.INTERNAL_SERVER_ERROR,
        "custom",
        messageOrConfig.message,
        messageOrConfig.error,
        messageOrConfig.data,
        Date.now(),
    );
}

export function createCustomSuccess<TData = unknown>(
    param: TData | SuccessConfig<unknown>,
): ApiSuccessResponse<TData | unknown> {
    if (
        typeof param === "object" &&
        param !== null &&
        "message" in param &&
        "data" in param
    ) {
        const config = param as SuccessConfig<unknown>;
        const status = config.status ?? HTTP_SUCCESS_STATUS.OK;
        return createApiSuccessResponse(
            status,
            config.data,
            "custom",
            config.message,
            Date.now(),
        );
    }

    return createApiSuccessResponse(
        HTTP_SUCCESS_STATUS.OK,
        param,
        "custom",
        "Success",
        Date.now(),
    );
}

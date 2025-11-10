import type { HttpErrorStatus, HttpSuccessStatus } from "@/lib/types";

import { API_RESPONSE_MESSAGES } from "./messages";
import type { ApiErrorResponse, ApiSuccessResponse } from "./responses";

// Base API Response Types are now defined in responses.ts

// Type Utilities for Message Processing
export type RemoveAllBrackets<T extends string> =
    T extends `${infer Before}[${string}]${infer After}`
        ? RemoveAllBrackets<`${Before}${After}`>
        : T;

export type SanitizeICUMessage<T extends string> =
    T extends `${infer Start}{${infer VarName}, plural, ${infer PluralContent}}${infer Rest}`
        ? `${Start}__ICU_VAR_${VarName}__${SanitizeICUMessage<RemoveAllBrackets<PluralContent>>}${SanitizeICUMessage<Rest>}`
        : T;

export type ExtractVariablesFromSanitized<T extends string> = string extends T
    ? string
    : T extends `${string}__ICU_VAR_${infer VarName}__${infer Rest}`
      ? VarName | ExtractVariablesFromSanitized<Rest>
      : T extends `${string}{${infer Name}}${infer Rest}`
        ? Name | ExtractVariablesFromSanitized<Rest>
        : never;

export type ExtractMessageVariables<T extends string> =
    ExtractVariablesFromSanitized<SanitizeICUMessage<T>>;

// Function Type Definitions
export type ErrorFn<TString extends string, TError = unknown> =
    ExtractMessageVariables<TString> extends never
        ? <E = TError>(error?: E) => ApiErrorResponse<E>
        : <E = TError>(
              error: E | undefined,
              placeholders: {
                  [K in ExtractMessageVariables<TString>]: string | number;
              },
          ) => ApiErrorResponse<E>;

export type SuccessFn<TString extends string, TData = unknown> =
    ExtractMessageVariables<TString> extends never
        ? <D = TData>(data: D) => ApiSuccessResponse<D>
        : <D = TData>(
              data: D,
              placeholders: {
                  [K in ExtractMessageVariables<TString>]: string | number;
              },
          ) => ApiSuccessResponse<D>;

// Mapping Types
export type MapToErrorFn<T> = T extends string
    ? ErrorFn<T>
    : T extends { message: string; status: number }
      ? ErrorFn<T["message"]>
      : { [K in keyof T]: MapToErrorFn<T[K]> };

export type MapToSuccessFn<T> = T extends string
    ? SuccessFn<T>
    : T extends { message: string; status: number }
      ? SuccessFn<T["message"]>
      : { [K in keyof T]: MapToSuccessFn<T[K]> };

// API Type Definitions
export type ErrorApi = MapToErrorFn<typeof API_RESPONSE_MESSAGES.error>;
export type SuccessApi = MapToSuccessFn<typeof API_RESPONSE_MESSAGES.success>;

// Configuration Types
export type ErrorConfig<TError = unknown> = {
    message: string;
    error?: TError;
    status?: HttpErrorStatus;
    data?: unknown;
};

export type SuccessConfig<TData> = {
    message: string;
    data: TData;
    status?: HttpSuccessStatus;
};

export type IsSuccessConfig<T> = T extends { message: string; data: unknown }
    ? true
    : false;

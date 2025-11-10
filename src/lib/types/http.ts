import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from "@/lib/constants";

export type HttpSuccessStatus =
    (typeof HTTP_SUCCESS_STATUS)[keyof typeof HTTP_SUCCESS_STATUS];
export type HttpErrorStatus =
    (typeof HTTP_ERROR_STATUS)[keyof typeof HTTP_ERROR_STATUS];

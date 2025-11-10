import { objectValuesToTuple } from "@/lib/utils";

export const HTTP_ERROR_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

export const HTTP_ERROR_STATUS_LIST = objectValuesToTuple(HTTP_ERROR_STATUS);

export const HTTP_SUCCESS_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
} as const;

export const HTTP_SUCCESS_STATUS_LIST =
    objectValuesToTuple(HTTP_SUCCESS_STATUS);

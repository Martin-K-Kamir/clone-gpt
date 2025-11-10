import {
    createCustomError,
    createCustomSuccess,
    createErrorFactory,
    createSuccessFactory,
} from "./factories";
import { API_RESPONSE_MESSAGES } from "./messages";
import type { ErrorApi, SuccessApi } from "./types";

export * from "./types";
export * from "./responses";

const errorApi = createErrorFactory(API_RESPONSE_MESSAGES.error) as ErrorApi;
const successApi = createSuccessFactory(
    API_RESPONSE_MESSAGES.success,
) as SuccessApi;

export const api = {
    error: Object.assign(createCustomError, errorApi) as typeof errorApi &
        typeof createCustomError,
    success: Object.assign(
        createCustomSuccess,
        successApi,
    ) as typeof successApi & typeof createCustomSuccess,
};

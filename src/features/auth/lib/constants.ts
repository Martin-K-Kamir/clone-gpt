import { objectValuesToTuple } from "@/lib/utils";

export const AUTH_EXTERNAL_PROVIDER = {
    GITHUB: "github",
    GOOGLE: "google",
} as const;

export const AUTH_CUSTOM_PROVIDER = {
    CREDENTIALS: "credentials",
    GUEST: "guest",
} as const;

export const AUTH_PROVIDER = {
    ...AUTH_EXTERNAL_PROVIDER,
    ...AUTH_CUSTOM_PROVIDER,
} as const;

export const AUTH_EXTERNAL_PROVIDERS_LIST = objectValuesToTuple(
    AUTH_EXTERNAL_PROVIDER,
);
export const AUTH_CUSTOM_PROVIDERS_LIST =
    objectValuesToTuple(AUTH_CUSTOM_PROVIDER);
export const AUTH_PROVIDERS_LIST = objectValuesToTuple(AUTH_PROVIDER);

export const MIN_NAME_LENGTH = 2;
export const MIN_PASSWORD_LENGTH = 6;

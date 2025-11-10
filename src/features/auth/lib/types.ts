import {
    AUTH_CUSTOM_PROVIDERS_LIST,
    AUTH_EXTERNAL_PROVIDERS_LIST,
    AUTH_PROVIDERS_LIST,
} from "@/features/auth/lib/constants";
import type { DBUserRole } from "@/features/user/lib/types";

export type Session = {
    user: {
        name: string;
        image: string;
        role: DBUserRole;
    };
};

export type AuthExternalProvider =
    (typeof AUTH_EXTERNAL_PROVIDERS_LIST)[number];
export type AuthCustomProvider = (typeof AUTH_CUSTOM_PROVIDERS_LIST)[number];
export type AuthProvider = (typeof AUTH_PROVIDERS_LIST)[number];

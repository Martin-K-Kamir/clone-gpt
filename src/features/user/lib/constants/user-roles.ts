import type { DBUserRole } from "@/features/user/lib/types";
import { objectValuesToTuple } from "@/lib/utils";

export const USER_ROLE = {
    GUEST: "guest",
    USER: "user",
    ADMIN: "admin",
} as const satisfies Record<Uppercase<DBUserRole>, DBUserRole>;

export const USER_ROLES_LIST = objectValuesToTuple(USER_ROLE);

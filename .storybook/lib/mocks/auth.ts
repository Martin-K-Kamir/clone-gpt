import type {
    DBUserId,
    DBUserRole,
} from "../../../src/features/user/lib/types";
import { FIXED_DATE } from "./chats";
import { createMockGuestUser, createMockUser } from "./users";

export function createMockSignupUserData(overrides?: {
    id?: DBUserId;
    email?: string;
    name?: string;
    image?: string | null;
    role?: DBUserRole;
}) {
    const user = createMockUser(overrides);
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? null,
        role: user.role as DBUserRole,
    };
}

export const MOCK_SESSION_EXPIRES = new Date(
    FIXED_DATE.getTime() + 24 * 60 * 60 * 1000,
).toISOString();

export function createMockGuestSession() {
    return {
        user: createMockGuestUser(),
        expires: MOCK_SESSION_EXPIRES,
    };
}

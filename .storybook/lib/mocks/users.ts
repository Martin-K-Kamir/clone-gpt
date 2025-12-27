import { USER_ROLE } from "../../../src/features/user/lib/constants/user-roles";
import type { DBUserId, UIUser } from "../../../src/features/user/lib/types";

export const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001" as DBUserId;

export function createMockUser(overrides?: Partial<UIUser>): UIUser {
    return {
        id: MOCK_USER_ID,
        name: "John Doe",
        email: "test@example.com",
        role: USER_ROLE.USER,
        image: null,
        ...overrides,
    };
}

export function createMockUsers(count: number): UIUser[] {
    return Array.from({ length: count }, (_, index) =>
        createMockUser({
            id: `${index.toString().padStart(8, "0")}-0000-0000-0000-000000000001` as DBUserId,
            name: `User ${index + 1}`,
            email: `user${index + 1}@example.com`,
        }),
    );
}

export function createMockGuestUser(): UIUser {
    return createMockUser({
        role: USER_ROLE.GUEST,
    });
}

export function createMockAdminUser(): UIUser {
    return createMockUser({
        role: USER_ROLE.ADMIN,
    });
}

import { USER_ROLE } from "../../../src/features/user/lib/constants/user-roles";
import type {
    DBUser,
    DBUserChatPreferences,
    DBUserId,
    UIUser,
} from "../../../src/features/user/lib/types";

const FIXED_DATE_STRING = "2025-01-01T00:00:00.000Z";
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

export function createMockGuestUser(overrides?: Partial<UIUser>): UIUser {
    return createMockUser({
        ...overrides,
        role: USER_ROLE.GUEST,
    });
}

export function createMockAdminUser(overrides?: Partial<UIUser>): UIUser {
    return createMockUser({
        ...overrides,
        role: USER_ROLE.ADMIN,
    });
}

export function createMockDBUser(overrides?: Partial<DBUser>): DBUser {
    return {
        id: MOCK_USER_ID,
        name: "John Doe",
        email: "test@example.com",
        role: USER_ROLE.USER,
        image: null,
        password: null,
        createdAt: FIXED_DATE_STRING,
        ...overrides,
    };
}

export function createMockUserChatPreferences(
    overrides?: Partial<DBUserChatPreferences>,
): DBUserChatPreferences {
    return {
        id: "00000000-0000-0000-0000-000000000010",
        userId: MOCK_USER_ID,
        nickname: "Johnny",
        role: "Software Engineer",
        personality: "FRIENDLY",
        characteristics: "Quick Wit, Direct",
        extraInfo: "I love coding and playing guitar",
        createdAt: FIXED_DATE_STRING,
        ...overrides,
    };
}

export function createMockEmptyUserChatPreferences(
    overrides?: Partial<DBUserChatPreferences>,
): DBUserChatPreferences {
    return {
        id: "00000000-0000-0000-0000-000000000011",
        userId: MOCK_USER_ID,
        nickname: null,
        role: null,
        personality: "FRIENDLY",
        characteristics: null,
        extraInfo: null,
        createdAt: FIXED_DATE_STRING,
        ...overrides,
    };
}

export const MOCK_USER_CHAT_PREFERENCES = createMockUserChatPreferences();
export const MOCK_EMPTY_USER_CHAT_PREFERENCES =
    createMockEmptyUserChatPreferences();
export const MOCK_USER = createMockUser();
export const MOCK_SESSION = {
    user: MOCK_USER,
    expires: FIXED_DATE_STRING,
};

export const MOCK_GUEST_USER = createMockGuestUser({
    name: "Guest",
    email: "guest@example.com",
});
export const MOCK_GUEST_SESSION = {
    user: MOCK_GUEST_USER,
    expires: FIXED_DATE_STRING,
};

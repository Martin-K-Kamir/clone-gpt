import { generateUserEmail, generateUserId } from "./generate-test-ids";

export function createMockSession() {
    return {
        user: {
            id: generateUserId(),
            email: generateUserEmail(),
            name: "Test User",
            image: null,
            role: "user" as const,
        },
    };
}

export function createMockSessionWithUser(
    userId?: ReturnType<typeof generateUserId>,
) {
    return {
        user: {
            id: userId ?? generateUserId(),
            email: generateUserEmail(),
            name: "Test User",
            image: null,
            role: "user" as const,
        },
    };
}

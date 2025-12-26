import { USER_ROLE } from "#src/features/user/lib/constants/user-roles.js";
import type { Session } from "next-auth";
import { fn } from "storybook/test";

export const auth = fn(async (): Promise<Session | null> => {
    return {
        user: {
            id: "00000000-0000-0000-0000-000000000001",
            name: "John Doe",
            email: "john.doe@example.com",
            role: USER_ROLE.USER,
            image: undefined,
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    } as Session;
}).mockName("auth");

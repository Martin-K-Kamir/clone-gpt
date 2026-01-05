import { fn } from "storybook/test";

export const signInWithCredentials = fn(
    async ({
        email,
        password,
        redirectTo = "/",
    }: {
        email: string;
        password: string;
        redirectTo?: string;
    }) => {
        return {
            success: true,
            message: "Signed in successfully!",
            data: null,
            timestamp: Date.now(),
        };
    },
).mockName("signInWithCredentials");

import { fn } from "storybook/test";

export const signUp = fn(
    async (data: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        return {
            success: true,
            message: "Account created successfully!",
            data: {
                id: "mock-user-id",
                email: data.email,
                name: data.name,
                image: null,
                role: "user",
            },
            timestamp: Date.now(),
        };
    },
).mockName("signUp");

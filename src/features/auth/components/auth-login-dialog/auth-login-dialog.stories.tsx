import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    signInWithCredentials,
    signUp,
} from "@/features/auth/services/actions";

import type { DBUserId, DBUserRole } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";

import { AuthLoginDialog, AuthLoginDialogTrigger } from "./auth-login-dialog";

const meta = preview.meta({
    component: AuthLoginDialog,
    tags: ["autodocs"],
    args: {
        defaultOpen: false,
    },
    decorators: [
        (Story, {}) => (
            <QueryProvider>
                <Story />
            </QueryProvider>
        ),
    ],
    parameters: {
        a11y: {
            test: "error",
        },
        layout: "centered",
    },
    argTypes: {
        dialogId: {
            control: "text",
            description: "Unique identifier for the dialog",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        open: {
            control: "boolean",
            description: "Whether the dialog is open",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultOpen: {
            control: "boolean",
            description: "Whether the dialog is open by default",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onOpenChange: {
            description: "Callback fired when the open state changes",
            table: {
                type: {
                    summary: "(open: boolean) => void",
                },
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    render: () => (
        <AuthLoginDialog>
            <AuthLoginDialogTrigger asChild>
                <Button>Open Login Dialog</Button>
            </AuthLoginDialogTrigger>
        </AuthLoginDialog>
    ),
    beforeEach: () => {
        mocked(signInWithCredentials).mockResolvedValue(
            api.success.auth.signin(null),
        );
        mocked(signUp).mockResolvedValue(
            api.success.auth.signup({
                id: "00000000-0000-0000-0000-000000000000" as DBUserId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user" as DBUserRole,
            }),
        );
    },
    afterEach: () => {
        mocked(signInWithCredentials).mockClear();
        mocked(signUp).mockClear();
    },
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();
    },
);

Default.test(
    "should render signin form by default when dialog opens",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();

        const buttons = document.querySelectorAll("button");
        const loginButton = Array.from(buttons).find(button =>
            button.textContent?.includes("Login"),
        );
        expect(loginButton).toBeInTheDocument();
    },
);

Default.test(
    "should switch to signup form when signup link is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const buttons = document.querySelectorAll("button");
        const signupButton = Array.from(buttons).find(button =>
            button.textContent?.includes("Sign up"),
        );
        expect(signupButton).toBeInTheDocument();
        await userEvent.click(signupButton!);

        const buttonsForSignupForm = document.querySelectorAll("button");
        const createAccountButton = Array.from(buttonsForSignupForm).find(
            button => button.textContent?.includes("Create Account"),
        );
        expect(createAccountButton).toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();
    },
);

Default.test(
    "should switch back to signin form from signup form",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const buttons = document.querySelectorAll("button");
        const signupButton = Array.from(buttons).find(button =>
            button.textContent?.includes("Sign up"),
        );
        expect(signupButton).toBeInTheDocument();
        await userEvent.click(signupButton!);

        const buttonsForSignupForm = document.querySelectorAll("button");
        const createAccountButton = Array.from(buttonsForSignupForm).find(
            button => button.textContent?.includes("Create Account"),
        );
        expect(createAccountButton).toBeInTheDocument();
        expect(signupButton).not.toBeInTheDocument();

        const signinButton = Array.from(buttonsForSignupForm).find(button =>
            button.textContent?.includes("Sign in"),
        );
        expect(signinButton).toBeInTheDocument();

        await userEvent.click(signinButton!);

        expect(signinButton).not.toBeInTheDocument();
        expect(createAccountButton).not.toBeInTheDocument();

        const buttonsForSigninForm = document.querySelectorAll("button");
        const loginButton = Array.from(buttonsForSigninForm).find(button =>
            button.textContent?.includes("Login"),
        );
        expect(loginButton).toBeInTheDocument();
    },
);

Default.test(
    "should close dialog on successful signin",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const emailInput = dialog?.querySelector(
            'input[name="email"]',
        ) as HTMLInputElement;
        const passwordInput = dialog?.querySelector(
            'input[type="password"]',
        ) as HTMLInputElement;

        const loginButton = Array.from(
            dialog?.querySelectorAll("button") || [],
        ).find(button => button.textContent === "Login");

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.click(loginButton!);

        await waitFor(() => {
            expect(mocked(signInWithCredentials)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should not close dialog on failed signin",
    async ({ canvas, userEvent }) => {
        mocked(signInWithCredentials).mockResolvedValueOnce(
            api.error.auth.general(new Error("Invalid credentials")),
        );

        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const emailInput = dialog?.querySelector(
            'input[name="email"]',
        ) as HTMLInputElement;
        const passwordInput = dialog?.querySelector(
            'input[type="password"]',
        ) as HTMLInputElement;
        const loginButton = Array.from(
            dialog?.querySelectorAll("button") || [],
        ).find(button => button.textContent === "Login");

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "wrongpassword");
        await userEvent.click(loginButton!);

        await waitFor(() => {
            expect(mocked(signInWithCredentials)).toHaveBeenCalled();
        });

        const stillOpenDialog = document.querySelector('[role="dialog"]');
        expect(stillOpenDialog).toBeInTheDocument();
    },
);

Default.test(
    "should switch to signup and submit form successfully",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const buttons = document.querySelectorAll("button");
        const signupButton = Array.from(buttons).find(button =>
            button.textContent?.includes("Sign up"),
        );
        expect(signupButton).toBeInTheDocument();
        await userEvent.click(signupButton!);

        // Fill and submit signup form
        const nameInput = document.querySelector(
            'input[name="name"]',
        ) as HTMLInputElement;
        const emailInput = document.querySelector(
            'input[name="email"]',
        ) as HTMLInputElement;
        const passwordInput = document.querySelector(
            'input[name="password"]',
        ) as HTMLInputElement;
        const confirmPasswordInput = document.querySelector(
            'input[name="confirmPassword"]',
        ) as HTMLInputElement;
        const createAccountButton = document.querySelector(
            'button[type="submit"]',
        );

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "john@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.click(createAccountButton!);

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });

        const loginButton = document.querySelector(
            'button[type="submit"]',
        ) as HTMLButtonElement;
        expect(loginButton).toBeInTheDocument();
    },
);

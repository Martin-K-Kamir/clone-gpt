import { QueryProvider } from "#.storybook/lib/decorators/providers";
import { createMockSignupUserData } from "#.storybook/lib/mocks/auth";
import {
    findButtonByText,
    findInputByName,
    waitForDialog,
    waitForDialogToClose,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    signInWithCredentials,
    signUp,
} from "@/features/auth/services/actions";

import { api } from "@/lib/api-response";

import {
    AuthSignInDialog,
    AuthSignInDialogTrigger,
} from "./auth-signin-dialog";

const meta = preview.meta({
    component: AuthSignInDialog,
    args: {
        defaultOpen: false,
    },
    decorators: [
        Story => (
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
    render: () => (
        <AuthSignInDialog>
            <AuthSignInDialogTrigger asChild>
                <Button>Open Login Dialog</Button>
            </AuthSignInDialogTrigger>
        </AuthSignInDialog>
    ),
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should render signin form by default when dialog opens",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("dialog");
        expect(dialog).toBeInTheDocument();

        const loginButton = findButtonByText("Login");
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

        await waitForDialog("dialog");

        const signupButton = findButtonByText("Sign up");
        expect(signupButton).toBeInTheDocument();
        await userEvent.click(signupButton);

        const createAccountButton = findButtonByText("Create Account");
        expect(createAccountButton).toBeInTheDocument();
    },
);

Default.test(
    "should switch back to signin form from signup form",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const signupButton = findButtonByText("Sign up");
        expect(signupButton).toBeInTheDocument();
        await userEvent.click(signupButton);

        const createAccountButton = findButtonByText("Create Account");
        expect(createAccountButton).toBeInTheDocument();

        const signinButton = findButtonByText("Sign in");
        expect(signinButton).toBeInTheDocument();

        await userEvent.click(signinButton);

        const loginButton = findButtonByText("Login");
        expect(loginButton).toBeInTheDocument();
    },
);

Default.test(
    "should close dialog on successful signin",
    async ({ canvas, userEvent }) => {
        mocked(signInWithCredentials).mockResolvedValueOnce(
            api.success.auth.signin(null),
        );

        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("dialog");
        expect(dialog).toBeInTheDocument();

        const emailInput = findInputByName("email");
        const passwordInput = findInputByName("password");
        const loginButton = findButtonByText("Login");

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(mocked(signInWithCredentials)).toHaveBeenCalled();
        });

        await waitForDialogToClose("dialog");
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

        const dialog = await waitForDialog("dialog");
        expect(dialog).toBeInTheDocument();

        const emailInput = findInputByName("email");
        const passwordInput = findInputByName("password");
        const loginButton = findButtonByText("Login");

        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "wrongpassword");
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(mocked(signInWithCredentials)).toHaveBeenCalled();
        });

        const stillOpenDialog = await waitForDialog("dialog");
        expect(stillOpenDialog).toBeInTheDocument();
    },
);

Default.test(
    "should switch to signup and submit form successfully",
    async ({ canvas, userEvent }) => {
        mocked(signUp).mockResolvedValueOnce(
            api.success.auth.signup(
                createMockSignupUserData({
                    email: "john@example.com",
                }),
            ),
        );

        const trigger = canvas.getByRole("button", {
            name: /open login dialog/i,
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const signupButton = findButtonByText("Sign up");
        expect(signupButton).toBeInTheDocument();
        await userEvent.click(signupButton);

        const nameInput = findInputByName("name");
        const emailInput = findInputByName("email");
        const passwordInput = findInputByName("password");
        const confirmPasswordInput = findInputByName("confirmPassword");
        const createAccountButton = findButtonByText("Create Account");

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "john@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });

        const loginButton = findButtonByText("Login");
        expect(loginButton).toBeInTheDocument();
    },
);

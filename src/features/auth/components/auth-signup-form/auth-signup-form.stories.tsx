import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { signUp } from "@/features/auth/services/actions";

import type { DBUserId, DBUserRole } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";

import { AuthSignUpForm } from "./auth-signup-form";

const meta = preview.meta({
    component: AuthSignUpForm,

    args: {
        onSubmit: fn(),
        onSuccess: fn(),
        onError: fn(),
        onSwitchToSignin: fn(),
        switchToSignin: false,
    },
    decorators: [
        (Story, {}) => (
            <QueryProvider>
                <div className="min-w-md bg-zinc-925">
                    <Story />
                </div>
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
        switchToSignin: {
            control: "boolean",
            description:
                "Whether to redirect to signin page after successful signup",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onSwitchToSignin: {
            description: "Callback when switching to signin",
            table: {
                type: {
                    summary: "() => void",
                },
            },
        },
        onSubmit: {
            description: "Callback when form is submitted",
            table: {
                type: {
                    summary: "(values: SignupFormValues) => void",
                },
            },
        },
        onSuccess: {
            description: "Callback when signup is successful",
            table: {
                type: {
                    summary: "(values: SignupFormValues) => void",
                },
            },
        },
        onError: {
            description: "Callback when signup fails",
            table: {
                type: {
                    summary: "(error: Error) => void",
                },
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    beforeEach: () => {
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
        mocked(signUp).mockClear();
    },
});

Default.test("should render form with all fields", async ({ canvas }) => {
    const nameInput = canvas.getByLabelText(/name/i);
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/^password$/i);
    const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
    const createAccountButton = canvas.getByRole("button", {
        name: /create account/i,
    });
    const googleButton = canvas.getByRole("button", {
        name: /sign up with google/i,
    });
    const githubButton = canvas.getByRole("button", {
        name: /sign up with github/i,
    });

    expect(nameInput).toBeVisible();
    expect(emailInput).toBeVisible();
    expect(passwordInput).toBeVisible();
    expect(confirmPasswordInput).toBeVisible();
    expect(createAccountButton).toBeVisible();
    expect(googleButton).toBeVisible();
    expect(githubButton).toBeVisible();
});

Default.test("should have empty default values", async ({ canvas }) => {
    const nameInput = canvas.getByLabelText(/name/i);
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/^password$/i);
    const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
    expect(confirmPasswordInput).toHaveValue("");
});

Default.test(
    "should show validation errors for empty form",
    async ({ canvas, userEvent }) => {
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.click(createAccountButton);

        await waitFor(() => {
            const nameError = canvas.getByText(
                /name must be at least 2 characters/i,
            );
            expect(nameError).toBeVisible();
        });

        const emailError = canvas.getByText(/invalid email/i);
        expect(emailError).toBeVisible();

        const passwordError = canvas.getByText(
            /password must be at least 6 characters/i,
        );
        expect(passwordError).toBeVisible();
    },
);

Default.test(
    "should submit form with valid credentials",
    async ({ canvas, userEvent, args }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalledWith({
                name: "John Doe",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith({
                name: "John Doe",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });
    },
);

Default.test(
    "should submit form when pressing Enter on confirm password field",
    async ({ canvas, userEvent, args }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalledWith({
                name: "John Doe",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith({
                name: "John Doe",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });
    },
);

Default.test(
    "should call onSuccess callback on successful signup",
    async ({ canvas, userEvent, args }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "Jane Smith");
        await userEvent.type(emailInput, "jane@example.com");
        await userEvent.type(passwordInput, "s52ij3n523ij423h4b23uhb2");
        await userEvent.type(confirmPasswordInput, "s52ij3n523ij423h4b23uhb2");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(args.onSuccess).toHaveBeenCalledWith({
                name: "Jane Smith",
                email: "jane@example.com",
                password: "s52ij3n523ij423h4b23uhb2",
                confirmPassword: "s52ij3n523ij423h4b23uhb2",
            });
        });
    },
);

Default.test(
    "should call onError callback on failed signup",
    async ({ canvas, userEvent, args }) => {
        mocked(signUp).mockResolvedValueOnce(
            api.error.auth.emailExists("test@example.com"),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "Test User");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(args.onError).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should disable submit button while submitting",
    async ({ canvas, userEvent }) => {
        mocked(signUp).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve(
                                api.success.auth.signup({
                                    id: "00000000-0000-0000-0000-000000000000" as DBUserId,
                                    email: "test@example.com",
                                    name: "Test User",
                                    image: null,
                                    role: "user" as DBUserRole,
                                }),
                            ),
                        100,
                    ),
                ),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "Test User");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "asdoajdu123124ihusadaiusd");
        await userEvent.type(confirmPasswordInput, "asdoajdu123124ihusadaiusd");
        await userEvent.click(createAccountButton);

        expect(createAccountButton).toBeDisabled();

        await waitFor(() => {
            expect(createAccountButton).toBeEnabled();
        });
    },
);

Default.test(
    "should call onSwitchToSignin when signin link is clicked",
    async ({ canvas, userEvent, args }) => {
        const signinLink = canvas.getByRole("button", { name: /sign in/i });

        await userEvent.click(signinLink);

        await waitFor(() => {
            expect(args.onSwitchToSignin).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should render Google and GitHub signup buttons",
    async ({ canvas }) => {
        const googleButton = canvas.getByRole("button", {
            name: /sign up with google/i,
        });
        const githubButton = canvas.getByRole("button", {
            name: /sign up with github/i,
        });

        expect(googleButton).toBeVisible();
        expect(githubButton).toBeVisible();
    },
);

Default.test(
    "should disable OAuth buttons while submitting credentials",
    async ({ canvas, userEvent }) => {
        mocked(signUp).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve(
                                api.success.auth.signup({
                                    id: "00000000-0000-0000-0000-000000000000" as DBUserId,
                                    email: "test@example.com",
                                    name: "Test User",
                                    image: null,
                                    role: "user" as DBUserRole,
                                }),
                            ),
                        100,
                    ),
                ),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });
        const googleButton = canvas.getByRole("button", {
            name: /sign up with google/i,
        });
        const githubButton = canvas.getByRole("button", {
            name: /sign up with github/i,
        });

        await userEvent.type(nameInput, "Test User");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.click(createAccountButton);

        expect(googleButton).toBeDisabled();
        expect(githubButton).toBeDisabled();

        await waitFor(() => {
            expect(googleButton).toBeEnabled();
            expect(githubButton).toBeEnabled();
        });
    },
);

Default.test(
    "should show error for invalid email format",
    async ({ canvas, userEvent }) => {
        const emailInput = canvas.getByLabelText(/email/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(emailInput, "invalid-email");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            const emailError = canvas.getByText(/invalid email/i);
            expect(emailError).toBeVisible();
        });
    },
);

Default.test(
    "should show error for name too short",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "A");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            const nameError = canvas.getByText(
                /name must be at least 2 characters/i,
            );
            expect(nameError).toBeVisible();
        });
    },
);

Default.test(
    "should show error for password too short",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "12345");
        await userEvent.type(confirmPasswordInput, "12345");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            const passwordError = canvas.getByText(
                /password must be at least 6 characters/i,
            );
            expect(passwordError).toBeVisible();
        });
    },
);

Default.test(
    "should show error when passwords do not match",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "differentpassword");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            const passwordError = canvas.getByText(/passwords do not match/i);
            expect(passwordError).toBeVisible();
        });
    },
);

export const WithoutSwitchToSignin = meta.story({
    name: "Without Switch to Signin (Link)",
    args: {
        onSwitchToSignin: undefined,
    },
});

WithoutSwitchToSignin.test(
    "should render signin link when onSwitchToSignin is undefined",
    async ({ canvas }) => {
        const signinLink = canvas.getByRole("link", { name: /sign in/i });
        expect(signinLink).toBeVisible();
        expect(signinLink).toHaveAttribute("href", "/signin");
    },
);

export const WithSwitchToSigninRedirect = meta.story({
    name: "With Switch to Signin Redirect",
    args: {
        switchToSignin: true,
    },
});

WithSwitchToSigninRedirect.test(
    "should redirect to signin after successful signup when switchToSignin is true",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, "Test User");
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "password123");
        await userEvent.type(confirmPasswordInput, "password123");
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalled();
        });
    },
);

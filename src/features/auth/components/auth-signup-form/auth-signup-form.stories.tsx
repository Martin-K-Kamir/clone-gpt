import { QueryProvider } from "#.storybook/lib/decorators/providers";
import { createMockSignupUserData } from "#.storybook/lib/mocks/auth";
import {
    MOCK_AUTH_BUTTON_CREATE_ACCOUNT,
    MOCK_AUTH_BUTTON_SIGNIN,
    MOCK_AUTH_EMAIL_DEFAULT,
    MOCK_AUTH_EMAIL_INVALID,
    MOCK_AUTH_EMAIL_JANE,
    MOCK_AUTH_NAME_DEFAULT,
    MOCK_AUTH_NAME_JANE,
    MOCK_AUTH_NAME_SHORT,
    MOCK_AUTH_NAME_TEST,
    MOCK_AUTH_PASSWORD_DEFAULT,
    MOCK_AUTH_PASSWORD_DIFFERENT,
    MOCK_AUTH_PASSWORD_JANE,
    MOCK_AUTH_PASSWORD_SHORT,
    MOCK_AUTH_PASSWORD_TEST,
} from "#.storybook/lib/mocks/auth-forms";
import preview from "#.storybook/preview";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { signUp } from "@/features/auth/services/actions";

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
        Story => (
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

export const Default = meta.story();

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
        mocked(signUp).mockResolvedValueOnce(
            api.success.auth.signup(createMockSignupUserData()),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, MOCK_AUTH_NAME_DEFAULT);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalledWith({
                name: MOCK_AUTH_NAME_DEFAULT,
                email: MOCK_AUTH_EMAIL_DEFAULT,
                password: MOCK_AUTH_PASSWORD_DEFAULT,
                confirmPassword: MOCK_AUTH_PASSWORD_DEFAULT,
            });
        });

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith({
                name: MOCK_AUTH_NAME_DEFAULT,
                email: MOCK_AUTH_EMAIL_DEFAULT,
                password: MOCK_AUTH_PASSWORD_DEFAULT,
                confirmPassword: MOCK_AUTH_PASSWORD_DEFAULT,
            });
        });
    },
);

Default.test(
    "should submit form when pressing Enter on confirm password field",
    async ({ canvas, userEvent, args }) => {
        mocked(signUp).mockResolvedValueOnce(
            api.success.auth.signup(createMockSignupUserData()),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);

        await userEvent.type(nameInput, MOCK_AUTH_NAME_DEFAULT);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalledWith({
                name: MOCK_AUTH_NAME_DEFAULT,
                email: MOCK_AUTH_EMAIL_DEFAULT,
                password: MOCK_AUTH_PASSWORD_DEFAULT,
                confirmPassword: MOCK_AUTH_PASSWORD_DEFAULT,
            });
        });

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith({
                name: MOCK_AUTH_NAME_DEFAULT,
                email: MOCK_AUTH_EMAIL_DEFAULT,
                password: MOCK_AUTH_PASSWORD_DEFAULT,
                confirmPassword: MOCK_AUTH_PASSWORD_DEFAULT,
            });
        });
    },
);

Default.test(
    "should call onSuccess callback on successful signup",
    async ({ canvas, userEvent, args }) => {
        mocked(signUp).mockResolvedValueOnce(
            api.success.auth.signup(
                createMockSignupUserData({
                    email: MOCK_AUTH_EMAIL_JANE,
                    name: MOCK_AUTH_NAME_JANE,
                }),
            ),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, MOCK_AUTH_NAME_JANE);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_JANE);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_JANE);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_JANE);
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(args.onSuccess).toHaveBeenCalledWith({
                name: MOCK_AUTH_NAME_JANE,
                email: MOCK_AUTH_EMAIL_JANE,
                password: MOCK_AUTH_PASSWORD_JANE,
                confirmPassword: MOCK_AUTH_PASSWORD_JANE,
            });
        });
    },
);

Default.test(
    "should call onError callback on failed signup",
    async ({ canvas, userEvent, args }) => {
        mocked(signUp).mockResolvedValueOnce(
            api.error.auth.emailExists(MOCK_AUTH_EMAIL_DEFAULT),
        );

        const nameInput = canvas.getByLabelText(/name/i);
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/^password$/i);
        const confirmPasswordInput = canvas.getByLabelText(/confirm password/i);
        const createAccountButton = canvas.getByRole("button", {
            name: /create account/i,
        });

        await userEvent.type(nameInput, MOCK_AUTH_NAME_TEST);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_DEFAULT);
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
                                api.success.auth.signup(
                                    createMockSignupUserData({
                                        name: MOCK_AUTH_NAME_TEST,
                                    }),
                                ),
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

        await userEvent.type(nameInput, MOCK_AUTH_NAME_TEST);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_TEST);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_TEST);
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
                                api.success.auth.signup(
                                    createMockSignupUserData({
                                        name: MOCK_AUTH_NAME_TEST,
                                    }),
                                ),
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

        await userEvent.type(nameInput, MOCK_AUTH_NAME_TEST);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_DEFAULT);
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

        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_INVALID);
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

        await userEvent.type(nameInput, MOCK_AUTH_NAME_SHORT);
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

        await userEvent.type(nameInput, MOCK_AUTH_NAME_DEFAULT);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_SHORT);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_SHORT);
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

        await userEvent.type(nameInput, MOCK_AUTH_NAME_DEFAULT);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.type(
            confirmPasswordInput,
            MOCK_AUTH_PASSWORD_DIFFERENT,
        );
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            const passwordError = canvas.getByText(/passwords do not match/i);
            expect(passwordError).toBeVisible();
        });
    },
);

export const WithoutSwitchToSignin = meta.story({
    args: {
        onSwitchToSignin: undefined,
    },
});

WithoutSwitchToSignin.test(
    "should render signin link when onSwitchToSignin is undefined",
    async ({ canvas }) => {
        const signinLink = canvas.getByRole("link", {
            name: new RegExp(MOCK_AUTH_BUTTON_SIGNIN, "i"),
        });
        expect(signinLink).toBeVisible();
        expect(signinLink).toHaveAttribute("href", "/signin");
    },
);

export const WithSwitchToSigninRedirect = meta.story({
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

        await userEvent.type(nameInput, MOCK_AUTH_NAME_TEST);
        await userEvent.type(emailInput, MOCK_AUTH_EMAIL_DEFAULT);
        await userEvent.type(passwordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.type(confirmPasswordInput, MOCK_AUTH_PASSWORD_DEFAULT);
        await userEvent.click(createAccountButton);

        await waitFor(() => {
            expect(mocked(signUp)).toHaveBeenCalled();
        });
    },
);

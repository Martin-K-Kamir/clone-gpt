import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { signInWithCredentials } from "@/features/auth/services/actions";

import { api } from "@/lib/api-response";

import { AuthSigninForm } from "./auth-signin-form";

const meta = preview.meta({
    component: AuthSigninForm,
    tags: ["autodocs"],
    args: {
        onSubmit: fn(),
        onSuccess: fn(),
        onError: fn(),
        onSwitchToSignup: fn(),
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
        onSwitchToSignup: {
            description: "Callback when switching to signup",
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
                    summary: "(values: SigninFormValues) => void",
                },
            },
        },
        onSuccess: {
            description: "Callback when signin is successful",
            table: {
                type: {
                    summary: "(values: SigninFormValues) => void",
                },
            },
        },
        onError: {
            description: "Callback when signin fails",
            table: {
                type: {
                    summary: "(error: Error | unknown) => void",
                },
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    beforeEach: () => {
        mocked(signInWithCredentials).mockResolvedValue(
            api.success.auth.signin(null),
        );
    },
    afterEach: () => {
        mocked(signInWithCredentials).mockClear();
    },
});

Default.test("should render form with all fields", async ({ canvas }) => {
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const loginButton = canvas.getByRole("button", { name: "Login" });
    const googleButton = canvas.getByRole("button", {
        name: /login with google/i,
    });
    const githubButton = canvas.getByRole("button", {
        name: /login with github/i,
    });

    expect(emailInput).toBeVisible();
    expect(passwordInput).toBeVisible();
    expect(loginButton).toBeVisible();
    expect(googleButton).toBeVisible();
    expect(githubButton).toBeVisible();
});

Default.test("should have empty default values", async ({ canvas }) => {
    const emailInput = canvas.getByLabelText(/email/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
});

Default.test(
    "should show validation errors for empty form",
    async ({ canvas, userEvent }) => {
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.click(loginButton);

        const requiredErrors = canvas.getAllByText(/required/i);
        expect(requiredErrors).toHaveLength(2);
    },
);

Default.test(
    "should submit form with valid credentials",
    async ({ canvas, userEvent, args }) => {
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(
            passwordInput,
            "aasdia123ASDASD@!!!asiudasiud@123",
        );
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(mocked(signInWithCredentials)).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "aasdia123ASDASD@!!!asiudasiud@123",
            });
        });

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "aasdia123ASDASD@!!!asiudasiud@123",
            });
        });
    },
);

Default.test(
    "should submit form when pressing Enter on password field",
    async ({ canvas, userEvent, args }) => {
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(
            passwordInput,
            "aasdia123ASDASD@!!!asiudasiud@123",
        );
        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            expect(mocked(signInWithCredentials)).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "aasdia123ASDASD@!!!asiudasiud@123",
            });
        });

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "aasdia123ASDASD@!!!asiudasiud@123",
            });
        });
    },
);

Default.test(
    "should call onSuccess callback on successful signin",
    async ({ canvas, userEvent, args }) => {
        mocked(signInWithCredentials).mockResolvedValueOnce(
            api.success.auth.signin(null),
        );

        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(
            passwordInput,
            "aasdia123ASDASD@!!!asiudasiud@123",
        );
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(args.onSuccess).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "aasdia123ASDASD@!!!asiudasiud@123",
            });
        });
    },
);

Default.test(
    "should call onError callback on failed signin",
    async ({ canvas, userEvent, args }) => {
        mocked(signInWithCredentials).mockResolvedValueOnce(
            api.error.auth.general(new Error("Invalid credentials")),
        );

        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "wrongpassword");
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(args.onError).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should disable submit button while submitting",
    async ({ canvas, userEvent }) => {
        mocked(signInWithCredentials).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () => resolve(api.success.auth.signin(null)),
                        100,
                    ),
                ),
        );

        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(
            passwordInput,
            "aasdia123ASDASD@!!!asiudasiud@123",
        );
        await userEvent.click(loginButton);

        expect(loginButton).toBeDisabled();

        await waitFor(() => {
            expect(loginButton).toBeEnabled();
        });
    },
);

Default.test(
    "should call onSwitchToSignup when signup link is clicked",
    async ({ canvas, userEvent, args }) => {
        const signupLink = canvas.getByRole("button", { name: /sign up/i });

        await userEvent.click(signupLink);

        await waitFor(() => {
            expect(args.onSwitchToSignup).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should disable OAuth buttons while submitting credentials",
    async ({ canvas, userEvent }) => {
        mocked(signInWithCredentials).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () => resolve(api.success.auth.signin(null)),
                        100,
                    ),
                ),
        );

        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });
        const googleButton = canvas.getByRole("button", {
            name: /login with google/i,
        });
        const githubButton = canvas.getByRole("button", {
            name: /login with github/i,
        });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(
            passwordInput,
            "aasdia123ASDASD@!!!asiudasiud@123",
        );
        await userEvent.click(loginButton);

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
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, "invalid-email");
        await userEvent.click(loginButton);

        await waitFor(() => {
            const emailError = canvas.getByText(/invalid email/i);
            expect(emailError).toBeVisible();
        });
    },
);

Default.test(
    "should show error for password too short",
    async ({ canvas, userEvent }) => {
        const emailInput = canvas.getByLabelText(/email/i);
        const passwordInput = canvas.getByLabelText(/password/i);
        const loginButton = canvas.getByRole("button", { name: "Login" });

        await userEvent.clear(emailInput);
        await userEvent.clear(passwordInput);
        await userEvent.type(emailInput, "test@example.com");
        await userEvent.type(passwordInput, "12345");
        await userEvent.click(loginButton);

        await waitFor(() => {
            const passwordError = canvas.getByText(
                /password must be at least 6 characters/i,
            );
            expect(passwordError).toBeVisible();
        });
    },
);

export const WithoutSwitchToSignup = meta.story({
    name: "Without Switch to Signup (Link)",
    args: {
        onSwitchToSignup: undefined,
    },
});

WithoutSwitchToSignup.test(
    "should render signup link when onSwitchToSignup is undefined",
    async ({ canvas }) => {
        const signupLink = canvas.getByRole("link", { name: /sign up/i });
        expect(signupLink).toBeVisible();
        expect(signupLink).toHaveAttribute("href", "/signup");
    },
);

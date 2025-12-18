import preview from "#.storybook/preview";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import { signIn } from "@/features/auth/services/actions";

import { AuthSignInButton } from "./auth-signin-button";

const meta = preview.meta({
    component: AuthSignInButton,
    args: {
        provider: AUTH_PROVIDER.GOOGLE,
        children: "Sign in with Google",
        onClick: fn(),
        onSigningInChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        provider: {
            control: "select",
            description: "The authentication provider to use",
            options: [AUTH_PROVIDER.GOOGLE, AUTH_PROVIDER.GITHUB],
            table: {
                type: {
                    summary: "AuthExternalProvider",
                },
            },
        },
        children: {
            control: "text",
            description: "The button label text",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        variant: {
            control: "select",
            description: "The button variant",
            options: [
                "default",
                "destructive",
                "outline",
                "secondary",
                "tertiary",
                "ghost",
                "link",
            ],
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "outline",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the button is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onClick: {
            description: "Custom click handler",
            table: {
                type: {
                    summary: "(e: React.MouseEvent<HTMLButtonElement>) => void",
                },
            },
        },
        onSigningInChange: {
            description: "Callback when signing in state changes",
            table: {
                type: {
                    summary: "(isSigningIn: boolean) => void",
                },
            },
        },
    },
});

export const Google = meta.story({
    name: "Google Provider",
    args: {
        provider: AUTH_PROVIDER.GOOGLE,
        children: "Sign in with Google",
    },
});

Google.test("should be interactable", async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
});

Google.test(
    "should call signIn with Google provider on click",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");

        await userEvent.click(button);

        await waitFor(() => {
            expect(mocked(signIn)).toHaveBeenCalledWith({
                provider: AUTH_PROVIDER.GOOGLE,
            });
        });
    },
);

Google.test(
    "should call custom onClick handler",
    async ({ canvas, userEvent, args }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onClick).toHaveBeenCalled();
        });
    },
);

Google.test(
    "should call onSigningInChange when signing in state changes",
    async ({ canvas, userEvent, args }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onSigningInChange).toHaveBeenCalledWith(true);
        });
    },
);

export const GitHub = meta.story({
    name: "GitHub Provider",
    args: {
        provider: AUTH_PROVIDER.GITHUB,
        children: "Sign in with GitHub",
    },
});

GitHub.test("should render GitHub button with icon", async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button).toBeVisible();
    expect(button).toHaveTextContent("Sign in with GitHub");
});

GitHub.test(
    "should call signIn with GitHub provider on click",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");

        await userEvent.click(button);

        await waitFor(() => {
            expect(mocked(signIn)).toHaveBeenCalledWith({
                provider: AUTH_PROVIDER.GITHUB,
            });
        });
    },
);

export const Disabled = meta.story({
    name: "Disabled State",
    args: {
        provider: AUTH_PROVIDER.GOOGLE,
        children: "Sign in with Google",
        disabled: true,
    },
});

Disabled.test("should be disabled", async ({ canvas }) => {
    const button = await canvas.findByRole("button");
    expect(button).toBeDisabled();
});

Disabled.test(
    "should not call signIn when disabled",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");

        try {
            await userEvent.click(button);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await waitFor(() => {
            expect(mocked(signIn)).not.toHaveBeenCalled();
        });
    },
);

export const WithCustomVariant = meta.story({
    name: "With Custom Variant",
    args: {
        provider: AUTH_PROVIDER.GOOGLE,
        children: "Sign in with Google",
        variant: "default",
    },
});

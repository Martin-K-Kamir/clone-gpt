import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, fn, mocked, waitFor } from "storybook/test";

import {
    SessionSyncContext,
    SessionSyncProvider,
} from "@/features/auth/providers";
import { signOut } from "@/features/auth/services/actions";

import { UserSessionProvider } from "@/features/user/providers";

import type { SyncActionProps } from "@/lib/types";

import { AuthSignOutButton } from "./auth-signout-button";

// Store mock function for testing
let mockSignOutWithSync: ((props?: SyncActionProps) => Promise<void>) | null =
    null;

const meta = preview.meta({
    component: AuthSignOutButton,

    args: {
        children: "Log out",
        onClick: fn(),
    },
    decorators: [
        (Story, {}) => (
            <QueryProvider>
                <UserSessionProvider>
                    <SessionSyncProvider>
                        <Story />
                    </SessionSyncProvider>
                </UserSessionProvider>
            </QueryProvider>
        ),
    ],
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
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
        asChild: {
            control: "boolean",
            description: "Render as child component",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    args: {
        children: "Log out",
    },
});

Default.test("should be interactable", async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
});

Default.test("should call signOut on click", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");

    await userEvent.click(button);

    await waitFor(() => {
        expect(mocked(signOut)).toHaveBeenCalled();
    });
});

Default.test(
    "should call custom onClick handler",
    async ({ canvas, userEvent, args }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onClick).toHaveBeenCalled();
        });
    },
);

export const WithCustomVariant = meta.story({
    name: "With Custom Variant",
    args: {
        children: "Log out",
        variant: "outline",
    },
});

export const Disabled = meta.story({
    name: "Disabled State",
    args: {
        children: "Log out",
        disabled: true,
    },
});

Disabled.test("should be disabled", async ({ canvas }) => {
    const button = await canvas.findByRole("button");
    expect(button).toBeDisabled();
});

Disabled.test(
    "should not call signOut when disabled",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");

        try {
            await userEvent.click(button);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await waitFor(() => {
            expect(mocked(signOut)).not.toHaveBeenCalled();
        });
    },
);

export const WithMockedSignOutWithSync = meta.story({
    name: "With Mocked signOutWithSync",
    args: {
        children: "Log out",
    },
    decorators: [
        (Story, {}) => {
            mockSignOutWithSync = fn().mockName("signOutWithSync") as (
                props?: SyncActionProps,
            ) => Promise<void>;

            return (
                <QueryProvider>
                    <UserSessionProvider>
                        <SessionSyncContext.Provider
                            value={{
                                signOutWithSync: mockSignOutWithSync,
                            }}
                        >
                            <Story />
                        </SessionSyncContext.Provider>
                    </UserSessionProvider>
                </QueryProvider>
            );
        },
    ],
});

WithMockedSignOutWithSync.test(
    "should call signOutWithSync on click",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");

        await userEvent.click(button);

        await waitFor(() => {
            expect(mockSignOutWithSync).toHaveBeenCalled();
        });
    },
);

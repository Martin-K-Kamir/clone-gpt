import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { SessionSyncProvider } from "@/features/auth/providers";

import { deleteAllUserChats } from "@/features/chat/services/actions/delete-all-user-chats";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import { UserSessionProvider } from "@/features/user/providers";
import { deleteUser } from "@/features/user/services/actions/delete-user";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import {
    UserDeleteProfileDialog,
    UserDeleteProfileDialogTrigger,
} from "./user-delete-profile-dialog";

function getDeleteButton(dialog: Element | null) {
    const buttons = dialog?.querySelectorAll("button");

    if (!buttons) {
        return null;
    }

    return Array.from(buttons).find(
        button => button.textContent === "Delete Profile",
    );
}

const meta = preview.meta({
    component: UserDeleteProfileDialog,
    decorators: [
        Story => (
            <QueryProvider>
                <UserSessionProvider>
                    <SessionSyncProvider>
                        <Story />
                        <Toaster />
                    </SessionSyncProvider>
                </UserSessionProvider>
            </QueryProvider>
        ),
    ],
    argTypes: {
        showToast: {
            control: "boolean",
            description: "Whether to show toast notifications",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onDelete: {
            description: "Callback fired when delete is initiated",
            table: {
                type: {
                    summary: "() => void",
                },
            },
        },
        onDeleteError: {
            description: "Callback fired when delete fails",
            table: {
                type: {
                    summary: "(message: string, error?: Error) => void",
                },
            },
        },
        onDeleteSuccess: {
            description: "Callback fired when delete succeeds",
            table: {
                type: {
                    summary: "(message: string) => void",
                },
            },
        },
    },
    parameters: {
        a11y: {
            config: {
                rules: [
                    { id: "color-contrast", enabled: false },
                    { id: "aria-valid-attr-value", enabled: false },
                ],
            },
        },
    },
});

export const Default = meta.story({
    render: args => (
        <UserDeleteProfileDialog {...args}>
            <UserDeleteProfileDialogTrigger asChild>
                <Button variant="destructive">Delete My Profile</Button>
            </UserDeleteProfileDialogTrigger>
        </UserDeleteProfileDialog>
    ),
    beforeEach: () => {
        mocked(deleteAllUserChats).mockResolvedValue(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(deleteUser).mockResolvedValue(
            api.success.user.delete({
                id: "00000000-0000-0000-0000-000000000001",
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: USER_ROLE.USER,
                password: null,
                createdAt: new Date().toISOString(),
            }),
        );
    },
    afterEach: () => {
        mocked(deleteAllUserChats).mockClear();
        mocked(deleteUser).mockClear();
    },
    args: {
        showToast: true,
        onDelete: fn(),
        onDeleteError: fn(),
        onDeleteSuccess: fn(),
    },
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();
    },
);

Default.test(
    "should render Cancel and Delete Profile buttons",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();

            const buttons = dialog?.querySelectorAll("button");
            expect(buttons).toHaveLength(2);
        });
    },
);

Default.test(
    "should delete chats and user when Delete Profile is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(mocked(deleteUser)).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should call onDelete callback when delete is initiated",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(args.onDelete).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should call onDeleteSuccess callback on successful deletion",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(args.onDeleteSuccess).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should show success toast on successful deletion",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
    },
);

Default.test(
    "should close dialog after successful deletion",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(mocked(deleteUser)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should disable delete button while deleting",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve(
                                api.success.chat.delete(undefined, {
                                    count: PLURAL.MULTIPLE,
                                }),
                            ),
                        100,
                    ),
                ),
        );

        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });
        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        expect(deleteButton).toBeDisabled();

        await waitFor(() => {
            expect(deleteButton).toBeDisabled();
        });
    },
);

export const WithChatDeletionError = meta.story({
    render: args => (
        <UserDeleteProfileDialog {...args}>
            <UserDeleteProfileDialogTrigger asChild>
                <Button variant="destructive">Delete My Profile</Button>
            </UserDeleteProfileDialogTrigger>
        </UserDeleteProfileDialog>
    ),
    beforeEach: () => {
        mocked(deleteAllUserChats).mockResolvedValue(
            api.error.chat.delete(new Error("Failed to delete chats"), {
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(deleteUser).mockResolvedValue(
            api.success.user.delete({
                id: "00000000-0000-0000-0000-000000000001",
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: USER_ROLE.USER,
                password: null,
                createdAt: new Date().toISOString(),
            }),
        );
    },
    afterEach: () => {
        mocked(deleteAllUserChats).mockClear();
        mocked(deleteUser).mockClear();
    },
    args: {
        showToast: true,
        onDelete: fn(),
        onDeleteError: fn(),
        onDeleteSuccess: fn(),
    },
});

WithChatDeletionError.test(
    "should handle chat deletion error",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();

            expect(args.onDeleteError).toHaveBeenCalled();

            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();

            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

export const WithUserDeletionError = meta.story({
    name: "With User Deletion Error",
    render: args => (
        <UserDeleteProfileDialog {...args}>
            <UserDeleteProfileDialogTrigger asChild>
                <Button variant="destructive">Delete My Profile</Button>
            </UserDeleteProfileDialogTrigger>
        </UserDeleteProfileDialog>
    ),
    beforeEach: () => {
        mocked(deleteAllUserChats).mockResolvedValue(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(deleteUser).mockResolvedValue(
            api.error.user.delete(new Error("Failed to delete user")),
        );
    },
    afterEach: () => {
        mocked(deleteAllUserChats).mockClear();
        mocked(deleteUser).mockClear();
    },
    args: {
        showToast: true,
        onDelete: fn(),
        onDeleteError: fn(),
        onDeleteSuccess: fn(),
    },
});

WithUserDeletionError.test(
    "should handle user deletion error",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();

            expect(mocked(deleteUser)).toHaveBeenCalled();

            expect(args.onDeleteError).toHaveBeenCalled();

            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

export const WithoutToast = meta.story({
    render: args => (
        <UserDeleteProfileDialog {...args}>
            <UserDeleteProfileDialogTrigger asChild>
                <Button variant="destructive">Delete My Profile</Button>
            </UserDeleteProfileDialogTrigger>
        </UserDeleteProfileDialog>
    ),
    beforeEach: () => {
        mocked(deleteAllUserChats).mockResolvedValue(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(deleteUser).mockResolvedValue(
            api.success.user.delete({
                id: "00000000-0000-0000-0000-000000000001",
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: USER_ROLE.USER,
                password: null,
                createdAt: new Date().toISOString(),
            }),
        );
    },
    afterEach: () => {
        mocked(deleteAllUserChats).mockClear();
        mocked(deleteUser).mockClear();
    },
    args: {
        showToast: false,
        onDelete: fn(),
        onDeleteError: fn(),
        onDeleteSuccess: fn(),
    },
});

WithoutToast.test(
    "should not show toast when showToast is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /delete my profile/i,
        });
        await userEvent.click(trigger);

        const dialog = await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
            return dialog;
        });

        const deleteButton = getDeleteButton(dialog!);
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(mocked(deleteUser)).toHaveBeenCalled();
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        const toast = document.querySelector("[data-sonner-toast]");
        expect(toast).not.toBeInTheDocument();
    },
);

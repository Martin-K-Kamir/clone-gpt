import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_USER_BUTTON_DELETE_MY_PROFILE,
    MOCK_USER_BUTTON_DELETE_PROFILE,
} from "#.storybook/lib/mocks/user-components";
import { createMockDBUser } from "#.storybook/lib/mocks/users";
import {
    getAllButtonsInElement,
    getSonnerToast,
} from "#.storybook/lib/utils/elements";
import {
    waitForButtonInDialog,
    waitForDialog,
    waitForDialogToClose,
    waitForSonnerToast,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { deleteAllUserChats } from "@/features/chat/services/actions/delete-all-user-chats";

import { deleteUser } from "@/features/user/services/actions/delete-user";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import {
    UserDeleteProfileDialog,
    UserDeleteProfileDialogTrigger,
} from "./user-delete-profile-dialog";

const mockDBUser = createMockDBUser();

const meta = preview.meta({
    component: UserDeleteProfileDialog,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
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
                <Button variant="destructive">
                    {MOCK_USER_BUTTON_DELETE_MY_PROFILE}
                </Button>
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
            api.success.user.delete(mockDBUser),
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
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        await waitForDialog("alertdialog");
    },
);

Default.test(
    "should render Cancel and Delete Profile buttons",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        await waitFor(() => {
            const buttons = getAllButtonsInElement(dialog);
            expect(buttons).toHaveLength(2);
        });
    },
);

Default.test(
    "should delete chats and user when Delete Profile is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

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
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(args.onDelete).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should call onDeleteSuccess callback on successful deletion",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(args.onDeleteSuccess).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should show success toast on successful deletion",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitForSonnerToast();
    },
);

Default.test(
    "should close dialog after successful deletion",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(mocked(deleteUser)).toHaveBeenCalled();
        });

        await waitForDialogToClose("alertdialog");
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
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");
        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

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
                <Button variant="destructive">
                    {MOCK_USER_BUTTON_DELETE_MY_PROFILE}
                </Button>
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
            api.success.user.delete(mockDBUser),
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
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(args.onDeleteError).toHaveBeenCalled();
        });

        await waitForSonnerToast();

        await waitForDialog("alertdialog");
    },
);

export const WithUserDeletionError = meta.story({
    name: "With User Deletion Error",
    render: args => (
        <UserDeleteProfileDialog {...args}>
            <UserDeleteProfileDialogTrigger asChild>
                <Button variant="destructive">
                    {MOCK_USER_BUTTON_DELETE_MY_PROFILE}
                </Button>
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
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(mocked(deleteUser)).toHaveBeenCalled();
            expect(args.onDeleteError).toHaveBeenCalled();
        });

        await waitForDialog("alertdialog");
    },
);

export const WithoutToast = meta.story({
    render: args => (
        <UserDeleteProfileDialog {...args}>
            <UserDeleteProfileDialogTrigger asChild>
                <Button variant="destructive">
                    {MOCK_USER_BUTTON_DELETE_MY_PROFILE}
                </Button>
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
            api.success.user.delete(mockDBUser),
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
            name: new RegExp(MOCK_USER_BUTTON_DELETE_MY_PROFILE, "i"),
        });
        await userEvent.click(trigger);

        const dialog = await waitForDialog("alertdialog");

        const deleteButton = await waitForButtonInDialog(
            dialog,
            MOCK_USER_BUTTON_DELETE_PROFILE,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            expect(mocked(deleteUser)).toHaveBeenCalled();

            const toast = getSonnerToast();
            expect(toast).not.toBeInTheDocument();
        });
    },
);

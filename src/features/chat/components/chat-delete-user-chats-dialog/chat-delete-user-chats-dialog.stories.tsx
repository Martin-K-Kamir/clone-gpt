import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
    MOCK_CHAT_BUTTON_DELETE_CHATS,
} from "#.storybook/lib/mocks/chat";
import { getSonnerToast } from "#.storybook/lib/utils/elements";
import {
    findButtonByText,
    waitForDialog,
    waitForDialogToClose,
    waitForSonnerToast,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { deleteAllUserChats } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import {
    ChatDeleteAllDialogTrigger,
    ChatDeleteUserChatsDialog,
} from "./chat-delete-user-chats-dialog";

const meta = preview.meta({
    component: ChatDeleteUserChatsDialog,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
        ),
    ],
    args: {
        onDelete: fn(),
        onDeleteError: fn(),
        onDeleteSuccess: fn(),
    },
    argTypes: {
        redirectUrl: {
            control: "text",
            description: "URL to redirect to after successful deletion",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
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
});

export const Default = meta.story({
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">
                    {MOCK_CHAT_BUTTON_DELETE_CHATS}
                </Button>
            </ChatDeleteAllDialogTrigger>
        </ChatDeleteUserChatsDialog>
    ),
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

Default.test("should open dialog", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
    });
    await userEvent.click(trigger);

    await waitForDialog("alertdialog");
});

Default.test(
    "should delete all chats when delete all chats button is clicked",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should close dialog after successful delete",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitForDialogToClose("alertdialog");
    },
);

Default.test(
    "should show success toast when delete succeeds",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitForSonnerToast();
    },
);

Default.test(
    "should show error toast when delete fails",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.error.chat.delete(new Error("Failed to delete chats"), {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitForSonnerToast();
    },
);

Default.test(
    "should keep dialog open when delete fails",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.error.chat.delete(new Error("Failed to delete chats"), {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        const dialog = await waitForDialog("alertdialog");
        expect(dialog).toBeInTheDocument();
    },
);

Default.test(
    "should call onDelete when delete is initiated",
    async ({ canvas, userEvent, args }) => {
        const onDelete = args.onDelete as ReturnType<typeof fn>;
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledTimes(1);
        });
    },
);

Default.test(
    "should call onDeleteSuccess when delete succeeds",
    async ({ canvas, userEvent, args }) => {
        const onDeleteSuccess = args.onDeleteSuccess as ReturnType<typeof fn>;
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
        });
    },
);

Default.test(
    "should call onDeleteError when delete fails",
    async ({ canvas, userEvent, args }) => {
        const onDeleteError = args.onDeleteError as ReturnType<typeof fn>;
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.error.chat.delete(new Error("Failed to delete chats"), {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(onDeleteError).toHaveBeenCalledTimes(1);
        });
    },
);

export const WithoutToast = meta.story({
    args: {
        showToast: false,
    },
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">
                    {MOCK_CHAT_BUTTON_DELETE_CHATS}
                </Button>
            </ChatDeleteAllDialogTrigger>
        </ChatDeleteUserChatsDialog>
    ),
});

WithoutToast.test(
    "should not show toast when showToast is false",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        const toast = getSonnerToast();
        expect(toast).not.toBeInTheDocument();
    },
);

export const WithRedirect = meta.story({
    args: {
        redirectUrl: "/settings",
    },
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">
                    {MOCK_CHAT_BUTTON_DELETE_CHATS}
                </Button>
            </ChatDeleteAllDialogTrigger>
        </ChatDeleteUserChatsDialog>
    ),
});

WithRedirect.test(
    "should redirect to specified URL after successful delete",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DELETE_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = findButtonByText(
            MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(getRouter().replace).toHaveBeenCalledWith("/settings");
        });
    },
);

export const WithCurrentPath = meta.story({
    args: {
        redirectUrl: "/settings",
    },
    parameters: {
        nextjs: {
            navigation: {
                pathname: "/settings",
            },
        },
        a11y: {
            config: {
                rules: [
                    { id: "color-contrast", enabled: false },
                    { id: "aria-valid-attr-value", enabled: false },
                ],
            },
        },
    },
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">
                    {MOCK_CHAT_BUTTON_DELETE_CHATS}
                </Button>
            </ChatDeleteAllDialogTrigger>
        </ChatDeleteUserChatsDialog>
    ),
});

WithCurrentPath.test(
    "should not redirect if already on current path",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        getRouter().replace.mockClear();

        const originalPathname = window.location.pathname;
        window.history.replaceState({}, "", "/settings");

        try {
            const trigger = canvas.getByRole("button", {
                name: /delete chats/i,
            });
            await userEvent.click(trigger);

            await waitForDialog("alertdialog");

            const deleteButton = findButtonByText(
                MOCK_CHAT_BUTTON_DELETE_ALL_CHATS,
            );
            await userEvent.click(deleteButton);

            await waitFor(() => {
                expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            });

            expect(getRouter().replace).not.toHaveBeenCalled();
        } finally {
            window.history.replaceState({}, "", originalPathname);
        }
    },
);

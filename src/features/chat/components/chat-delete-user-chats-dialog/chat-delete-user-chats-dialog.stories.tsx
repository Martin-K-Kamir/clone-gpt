import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, fn, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
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
        Story => (
            <QueryProvider>
                <ChatOffsetProvider>
                    <ChatCacheSyncProvider>
                        <Story />
                        <Toaster />
                    </ChatCacheSyncProvider>
                </ChatOffsetProvider>
            </QueryProvider>
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
    name: "Default",
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">Delete Chats</Button>
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
    const trigger = canvas.getByRole("button", { name: /delete chats/i });
    await userEvent.click(trigger);

    const dialog = await waitFor(() =>
        document.querySelector('[role="alertdialog"]'),
    );
    expect(dialog).toBeInTheDocument();
});

Default.test(
    "should delete all chats when Delete All Chats button is clicked",
    async ({ canvas, userEvent }) => {
        mocked(deleteAllUserChats).mockResolvedValueOnce(
            api.success.chat.delete(undefined, {
                count: PLURAL.MULTIPLE,
            }),
        );

        const trigger = canvas.getByRole("button", {
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(
                document.querySelector('[role="alertdialog"]'),
            ).not.toBeInTheDocument();
        });
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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(
                document.querySelector('[role="alertdialog"]'),
            ).toBeInTheDocument();
        });
    },
);

// Default.test(
//     "should call onDelete when delete is initiated",
//     async ({ canvas, userEvent, args }) => {
//         const onDelete = args.onDelete as ReturnType<typeof fn>;
//         const trigger = canvas.getByRole("button", {
//             name: /delete chats/i,
//         });
//         await userEvent.click(trigger);

//         const buttons = Array.from(document.querySelectorAll("button"));
//         const deleteButton = buttons.find(
//             button => button.textContent?.trim() === "Delete All Chats",
//         );
//         await userEvent.click(deleteButton!);

//         await waitFor(() => {
//             expect(onDelete).toHaveBeenCalledTimes(1);
//         });
//     },
// );

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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(onDeleteError).toHaveBeenCalledTimes(1);
        });
    },
);

export const WithoutToast = meta.story({
    name: "Without Toast",
    args: {
        showToast: false,
    },
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">Delete Chats</Button>
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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        const toast = document.querySelector("[data-sonner-toast]");
        expect(toast).not.toBeInTheDocument();
    },
);

export const WithRedirect = meta.story({
    name: "With Redirect",
    args: {
        redirectUrl: "/settings",
    },
    render: args => (
        <ChatDeleteUserChatsDialog {...args}>
            <ChatDeleteAllDialogTrigger asChild>
                <Button variant="destructive">Delete Chats</Button>
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
            name: /delete chats/i,
        });
        await userEvent.click(trigger);

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete All Chats",
        );
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(getRouter().replace).toHaveBeenCalledWith("/settings");
        });
    },
);

export const WithCurrentPath = meta.story({
    name: "With Current Path",
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
                <Button variant="destructive">Delete Chats</Button>
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

            const buttons = Array.from(document.querySelectorAll("button"));
            const deleteButton = buttons.find(
                button => button.textContent?.trim() === "Delete All Chats",
            );
            await userEvent.click(deleteButton!);

            await waitFor(() => {
                expect(mocked(deleteAllUserChats)).toHaveBeenCalled();
            });

            expect(getRouter().replace).not.toHaveBeenCalled();
        } finally {
            window.history.replaceState({}, "", originalPathname);
        }
    },
);

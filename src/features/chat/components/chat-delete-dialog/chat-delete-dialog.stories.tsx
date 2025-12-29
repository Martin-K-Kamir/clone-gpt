import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_ID,
    createMockPrivateChat,
} from "#.storybook/lib/mocks/chats";
import { getElementsByText } from "#.storybook/lib/utils/elements.js";
import { getQueryClient } from "#.storybook/lib/utils/query-client";
import {
    findButtonByText,
    waitForDialog,
    waitForDialogToClose,
    waitForSonnerToast,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { deleteUserChatById } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";

import {
    ChatDeleteDialog,
    ChatDeleteDialogTrigger,
} from "./chat-delete-dialog";

const mockChat = createMockPrivateChat();

const meta = preview.meta({
    component: ChatDeleteDialog,
    args: {
        chat: mockChat,
    },
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
        ),
    ],
    argTypes: {
        chat: {
            control: "object",
            description: "The chat object to delete",
            table: {
                type: {
                    summary: "UIChat",
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
    render: args => (
        <ChatDeleteDialog {...args}>
            <ChatDeleteDialogTrigger asChild>
                <Button variant="destructive">Delete Chat</Button>
            </ChatDeleteDialogTrigger>
        </ChatDeleteDialog>
    ),
    beforeEach: () => {
        mocked(deleteUserChatById).mockResolvedValue(
            api.success.chat.delete(MOCK_CHAT_ID, {
                count: PLURAL.SINGLE,
            }),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);
        queryClient.removeQueries({ queryKey: [tag.userChats()] });
    },
    afterEach: () => {
        mocked(deleteUserChatById).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);
        queryClient.removeQueries({ queryKey: [tag.userChats()] });
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

Default.test("should open dialog", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /delete chat/i });
    await userEvent.click(trigger);

    await waitForDialog("alertdialog");
});

Default.test(
    "should display chat description",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const description = getElementsByText(
            "p",
            new RegExp(mockChat.title, "i"),
        );
        expect(description).toBeInTheDocument();
    },
);

Default.test(
    "should delete chat when delete button is clicked",
    async ({ canvas, userEvent }) => {
        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(MOCK_CHAT_ID, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = await waitFor(() => findButtonByText("Delete"));
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalledWith({
                chatId: MOCK_CHAT_ID,
            });
        });
    },
);

Default.test(
    "should close dialog after successful delete",
    async ({ canvas, userEvent }) => {
        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(MOCK_CHAT_ID, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = await waitFor(() => findButtonByText("Delete"));
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalled();
        });

        await waitForDialogToClose("alertdialog");
    },
);

Default.test(
    "should show error toast when delete fails",
    async ({ canvas, userEvent }) => {
        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.error.chat.delete(new Error("Failed to delete chat"), {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = await waitFor(() => findButtonByText("Delete"));
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalledWith({
                chatId: MOCK_CHAT_ID,
            });
        });

        await waitForSonnerToast();
    },
);

Default.test(
    "should revert cache changes when delete fails",
    async ({ canvas, userEvent }) => {
        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.error.chat.delete(new Error("Failed to delete chat"), {
                count: PLURAL.SINGLE,
            }),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = await waitFor(() => findButtonByText("Delete"));
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const cachedChat = queryClient.getQueryData([
                tag.userChat(MOCK_CHAT_ID),
            ]);
            expect(cachedChat).toBeDefined();
        });
    },
);

Default.test(
    "should not navigate when deleting non-active chat",
    async ({ canvas, userEvent }) => {
        const originalPathname = window.location.pathname;

        window.history.replaceState({}, "", "/");

        getRouter().replace.mockClear();

        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(MOCK_CHAT_ID, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = await waitFor(() => findButtonByText("Delete"));
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalled();
        });

        expect(getRouter().replace).not.toHaveBeenCalled();

        window.history.replaceState({}, "", originalPathname);
    },
);

export const Active = meta.story({
    parameters: {
        nextjs: {
            appDirectory: true,
            navigation: {
                pathname: `/chat/${MOCK_CHAT_ID}`,
                query: { chatId: MOCK_CHAT_ID },
            },
        },
    },
    render: args => (
        <ChatDeleteDialog {...args}>
            <ChatDeleteDialogTrigger asChild>
                <Button variant="destructive">Delete Chat</Button>
            </ChatDeleteDialogTrigger>
        </ChatDeleteDialog>
    ),
});

Active.test(
    "should navigate to home when deleting active chat",
    async ({ canvas, userEvent }) => {
        getRouter().replace.mockClear();

        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(MOCK_CHAT_ID, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        await waitForDialog("alertdialog");

        const deleteButton = await waitFor(() => findButtonByText("Delete"));
        await userEvent.click(deleteButton);

        expect(getRouter().replace).toHaveBeenCalledWith("/");
        expect(mocked(deleteUserChatById)).toHaveBeenCalled();
    },
);

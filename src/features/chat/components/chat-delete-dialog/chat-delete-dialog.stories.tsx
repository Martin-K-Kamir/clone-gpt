import preview from "#.storybook/preview";
import { QueryProvider, getQueryClient } from "@/providers/query-provider";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, UIChat } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
import { deleteUserChatById } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";

import {
    ChatDeleteDialog,
    ChatDeleteDialogTrigger,
} from "./chat-delete-dialog";

const stableDate = new Date("2025-01-01").toISOString();
const mockChatId = "00000000-0000-0000-0000-000000000001" as DBChatId;

const mockChat: UIChat = {
    id: mockChatId,
    title: "My Chat Conversation",
    visibility: CHAT_VISIBILITY.PRIVATE,
    createdAt: stableDate,
    updatedAt: stableDate,
    visibleAt: stableDate,
};

const meta = preview.meta({
    component: ChatDeleteDialog,
    args: {
        chat: mockChat,
    },
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
    name: "Default",
    render: args => (
        <ChatDeleteDialog {...args}>
            <ChatDeleteDialogTrigger asChild>
                <Button variant="destructive">Delete Chat</Button>
            </ChatDeleteDialogTrigger>
        </ChatDeleteDialog>
    ),
    beforeEach: () => {
        mocked(deleteUserChatById).mockResolvedValue(
            api.success.chat.delete(mockChatId, {
                count: PLURAL.SINGLE,
            }),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(mockChatId)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);
        queryClient.removeQueries({ queryKey: [tag.userChats()] });
    },
    afterEach: () => {
        mocked(deleteUserChatById).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(mockChatId)], mockChat);
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

    const dialog = await waitFor(() =>
        document.querySelector('[role="alertdialog"]'),
    );
    expect(dialog).toBeInTheDocument();
});

Default.test(
    "should display correct description",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const paragraphs = Array.from(document.querySelectorAll("p"));
        const description = paragraphs.find(paragraph =>
            paragraph.textContent?.includes("My Chat Conversation"),
        );
        expect(description).toBeInTheDocument();
    },
);

Default.test(
    "should delete chat when Delete button is clicked",
    async ({ canvas, userEvent }) => {
        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(mockChatId, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete",
        );
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalledWith({
                chatId: mockChatId,
            });
        });
    },
);

Default.test(
    "should close dialog after successful delete",
    async ({ canvas, userEvent }) => {
        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(mockChatId, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete",
        );
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(
                document.querySelector('[role="alertdialog"]'),
            ).not.toBeInTheDocument();
        });
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

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete",
        );
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalledWith({
                chatId: mockChatId,
            });
        });

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
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
        queryClient.setQueryData([tag.userChat(mockChatId)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete",
        );
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const cachedChat = queryClient.getQueryData([
                tag.userChat(mockChatId),
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
            api.success.chat.delete(mockChatId, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete",
        );
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            expect(mocked(deleteUserChatById)).toHaveBeenCalled();
        });

        expect(getRouter().replace).not.toHaveBeenCalled();

        window.history.replaceState({}, "", originalPathname);
    },
);

export const ActiveChat = meta.story({
    name: "Active Chat",
    parameters: {
        nextjs: {
            appDirectory: true,
            navigation: {
                pathname: `/chat/${mockChatId}`,
                query: { chatId: mockChatId },
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

ActiveChat.test(
    "should navigate to home when deleting active chat",
    async ({ canvas, userEvent }) => {
        getRouter().replace.mockClear();

        mocked(deleteUserChatById).mockResolvedValueOnce(
            api.success.chat.delete(mockChatId, {
                count: PLURAL.SINGLE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /delete chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const buttons = Array.from(document.querySelectorAll("button"));
        const deleteButton = buttons.find(
            button => button.textContent?.trim() === "Delete",
        );
        expect(deleteButton).toBeInTheDocument();
        await userEvent.click(deleteButton!);

        expect(getRouter().replace).toHaveBeenCalledWith("/");
        expect(mocked(deleteUserChatById)).toHaveBeenCalled();
    },
);

import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_ID,
    createMockPrivateChat,
    generateChatId,
} from "#.storybook/lib/mocks/chats";
import { getQueryClient } from "#.storybook/lib/utils/query-client";
import { waitForMenuItemByText } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import { updateChatTitle } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";

import { ChatSidebarHistoryItem } from "./chat-sidebar-history-item";

const mockChat = createMockPrivateChat();
const mockChatTitle = mockChat.title;

const meta = preview.meta({
    component: ChatSidebarHistoryItem,
    args: {
        chatId: MOCK_CHAT_ID,
        isActive: false,
        initialData: mockChat,
    },
    decorators: [
        (Story, { parameters }) => (
            <SidebarProvider>
                <AppProviders {...parameters.provider}>
                    <ul className="w-58 bg-zinc-925">
                        <Story />
                    </ul>
                </AppProviders>
            </SidebarProvider>
        ),
    ],
    parameters: {},
    argTypes: {
        chatId: {
            control: "text",
            description: "The chat ID",
            table: {
                type: {
                    summary: "DBChatId",
                },
            },
        },
        isActive: {
            control: "boolean",
            description: "Whether the chat item is currently active",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        initialData: {
            control: "object",
            description: "Initial chat data to avoid loading state",
            table: {
                type: {
                    summary: "UIChat",
                },
            },
        },
        animate: {
            control: "boolean",
            description: "Whether to animate the item on mount",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the list item",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameLink: {
            control: "text",
            description: "Additional CSS classes for the link",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameInput: {
            control: "text",
            description: "Additional CSS classes for the input (when renaming)",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        isActive: false,
        initialData: mockChat,
    },
    beforeEach: () => {
        mocked(updateChatTitle).mockResolvedValue(
            api.success.chat.rename(MOCK_CHAT_ID),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);
        queryClient.removeQueries({ queryKey: [tag.userChats()] });
    },
    afterEach: () => {
        mocked(updateChatTitle).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);
        queryClient.removeQueries({ queryKey: [tag.userChats()] });
    },
    parameters: {
        a11y: {
            disable: true,
        },
    },
});

Default.test("should render chat item", async ({ canvas }) => {
    const link = canvas.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent(mockChatTitle);
});

Default.test("should have correct href", async ({ canvas }) => {
    const link = canvas.getByRole("link");
    expect(link).toHaveAttribute("href", `/chat/${MOCK_CHAT_ID}`);
});

Default.test("should be interactive", async ({ canvas, userEvent }) => {
    const link = canvas.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toBeEnabled();

    let preventDefaultCalled = false;
    const clickHandler = (e: MouseEvent) => {
        e.preventDefault();
        preventDefaultCalled = true;
    };

    link.addEventListener("click", clickHandler, { once: true });

    await userEvent.click(link);

    expect(preventDefaultCalled).toBe(true);
});

Default.test("should open dropdown menu", async ({ canvas, userEvent }) => {
    const listItem = canvas.getByRole("listitem");
    expect(listItem).toBeInTheDocument();

    const button = canvas.getByRole("button", { name: "Open menu" });
    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");

    await waitForMenuItemByText(/./);
});

Default.test("should render rename input", async ({ canvas, userEvent }) => {
    const listItem = canvas.getByRole("listitem");
    expect(listItem).toBeInTheDocument();

    const button = canvas.getByRole("button", { name: "Open menu" });
    await userEvent.click(button);

    const renameItem = await waitForMenuItemByText("Rename");
    await userEvent.click(renameItem);

    const input = canvas.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveValue(mockChatTitle);
});

Default.test(
    "should rename when clicking outside input",
    async ({ canvas, userEvent }) => {
        mocked(updateChatTitle).mockResolvedValueOnce(
            api.success.chat.rename(MOCK_CHAT_ID),
        );

        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeInTheDocument();

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText("Rename");
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "New Chat Title");

        await userEvent.click(document.body);

        await waitFor(
            () => {
                expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        const link = canvas.getByRole("link");
        expect(link).toHaveTextContent("New Chat Title");

        expect(mocked(updateChatTitle)).toHaveBeenCalledWith({
            chatId: MOCK_CHAT_ID,
            newTitle: "New Chat Title",
        });
    },
);

Default.test(
    "should rename when pressing Enter",
    async ({ canvas, userEvent }) => {
        mocked(updateChatTitle).mockResolvedValueOnce(
            api.success.chat.rename(MOCK_CHAT_ID),
        );

        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeInTheDocument();

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText("Rename");
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "New Chat Title{Enter}");

        await waitFor(
            () => {
                expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        await waitFor(() => {
            const link = canvas.getByRole("link");
            expect(link).toHaveTextContent("New Chat Title");
        });

        expect(mocked(updateChatTitle)).toHaveBeenCalledWith({
            chatId: MOCK_CHAT_ID,
            newTitle: "New Chat Title",
        });
    },
);

Default.test(
    "should not change name when rename fails",
    async ({ canvas, userEvent }) => {
        mocked(updateChatTitle).mockResolvedValueOnce(
            api.error.chat.rename(new Error("Failed to rename chat")),
        );

        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeInTheDocument();

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText("Rename");
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "New Chat Title");

        await userEvent.type(input, "{Enter}");

        await waitFor(
            () => {
                expect(mocked(updateChatTitle)).toHaveBeenCalled();
            },
            { timeout: 2000 },
        );

        await waitFor(() => {
            const link = canvas.getByRole("link");
            expect(link).toHaveTextContent(mockChatTitle);
        });

        expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    },
);

Default.test(
    "should cancel rename when pressing Escape",
    async ({ canvas, userEvent }) => {
        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeInTheDocument();

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText("Rename");
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "New Chat Title");

        await userEvent.type(input, "{Escape}");

        await waitFor(
            () => {
                expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
            },
            { timeout: 1000 },
        );

        await waitFor(() => {
            const link = canvas.getByRole("link");
            expect(link).toHaveTextContent(mockChatTitle);
        });

        expect(mocked(updateChatTitle)).not.toHaveBeenCalled();
    },
);

Default.test(
    "should not trigger request when renamed to same value",
    async ({ canvas, userEvent }) => {
        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeInTheDocument();

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText("Rename");
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, mockChatTitle);

        await userEvent.type(input, "{Enter}");

        expect(mocked(updateChatTitle)).not.toHaveBeenCalled();

        expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    },
);

export const Active = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        isActive: true,
        initialData: mockChat,
    },
    parameters: {
        a11y: {
            disable: true,
        },
    },
});

Active.test("should mark active chat item", async ({ canvas }) => {
    const link = canvas.getByRole("link");
    expect(link).toHaveAttribute("data-active", "true");
    expect(link).toHaveAttribute("aria-current", "page");
});

export const LongTitle = meta.story({
    args: {
        chatId: generateChatId(1),
        isActive: false,
        initialData: {
            ...mockChat,
            title: "This is a very long chat title that should be truncated when displayed in the sidebar",
        },
    },
});

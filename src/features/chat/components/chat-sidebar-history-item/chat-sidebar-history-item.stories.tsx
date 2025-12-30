import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
    MOCK_CHAT_BUTTON_RENAME,
    MOCK_CHAT_ERROR_RENAME_CHAT,
    MOCK_CHAT_TITLE_NEW,
} from "#.storybook/lib/mocks/chat";
import {
    MOCK_CHAT_ID,
    createMockPrivateChat,
    generateChatId,
} from "#.storybook/lib/mocks/chats";
import { getQueryClient } from "#.storybook/lib/utils/query-client";
import {
    clickLinkAndVerify,
    waitForMenuItemByText,
} from "#.storybook/lib/utils/test-helpers";
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

    await clickLinkAndVerify(link, userEvent);
});

Default.test("should open dropdown menu", async ({ canvas, userEvent }) => {
    const listItem = canvas.getByRole("listitem");
    expect(listItem).toBeInTheDocument();

    const button = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
    });
    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");

    await waitForMenuItemByText(/./);
});

Default.test("should render rename input", async ({ canvas, userEvent }) => {
    const listItem = canvas.getByRole("listitem");
    expect(listItem).toBeInTheDocument();

    const button = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
    });
    await userEvent.click(button);

    const renameItem = await waitForMenuItemByText(MOCK_CHAT_BUTTON_RENAME);
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

        const button = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
        });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText(MOCK_CHAT_BUTTON_RENAME);
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, MOCK_CHAT_TITLE_NEW);

        await userEvent.click(document.body);

        await waitFor(
            () => {
                expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        const link = canvas.getByRole("link");
        expect(link).toHaveTextContent(MOCK_CHAT_TITLE_NEW);

        expect(mocked(updateChatTitle)).toHaveBeenCalledWith({
            chatId: MOCK_CHAT_ID,
            newTitle: MOCK_CHAT_TITLE_NEW,
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

        const button = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
        });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText(MOCK_CHAT_BUTTON_RENAME);
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, `${MOCK_CHAT_TITLE_NEW}{Enter}`);

        await waitFor(
            () => {
                expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
            },
            { timeout: 2000 },
        );

        await waitFor(() => {
            const link = canvas.getByRole("link");
            expect(link).toHaveTextContent(MOCK_CHAT_TITLE_NEW);
        });

        expect(mocked(updateChatTitle)).toHaveBeenCalledWith({
            chatId: MOCK_CHAT_ID,
            newTitle: MOCK_CHAT_TITLE_NEW,
        });
    },
);

Default.test(
    "should not change name when rename fails",
    async ({ canvas, userEvent }) => {
        mocked(updateChatTitle).mockResolvedValueOnce(
            api.error.chat.rename(new Error(MOCK_CHAT_ERROR_RENAME_CHAT)),
        );

        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeInTheDocument();

        const button = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
        });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText(MOCK_CHAT_BUTTON_RENAME);
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, MOCK_CHAT_TITLE_NEW);

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

        const button = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
        });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText(MOCK_CHAT_BUTTON_RENAME);
        await userEvent.click(renameItem);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, MOCK_CHAT_TITLE_NEW);

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

        const button = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_MENU_LOWERCASE,
        });
        await userEvent.click(button);

        const renameItem = await waitForMenuItemByText(MOCK_CHAT_BUTTON_RENAME);
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

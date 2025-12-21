import preview from "#.storybook/preview";
import { QueryProvider, getQueryClient } from "@/providers/query-provider";
import { HttpResponse, http } from "msw";
import { expect, mocked, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, UIChat } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
import { updateChatTitle } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";

import { ChatSidebarHistoryItem } from "./chat-sidebar-history-item";

const mockChatId = "chat-1" as DBChatId;

const mockChat: UIChat = {
    id: mockChatId,
    title: "My Chat Conversation",
    visibility: CHAT_VISIBILITY.PRIVATE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleAt: new Date().toISOString(),
};

const meta = preview.meta({
    component: ChatSidebarHistoryItem,
    args: {
        chatId: mockChatId,
        isActive: false,
        initialData: mockChat,
    },
    decorators: [
        Story => (
            <QueryProvider>
                <SidebarProvider>
                    <ChatOffsetProvider>
                        <ChatCacheSyncProvider>
                            <ul className="w-58 bg-zinc-925">
                                <Story />
                            </ul>
                        </ChatCacheSyncProvider>
                    </ChatOffsetProvider>
                </SidebarProvider>
            </QueryProvider>
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
    name: "Default",
    args: {
        chatId: mockChatId,
        isActive: false,
        initialData: mockChat,
    },
    beforeEach: () => {
        mocked(updateChatTitle).mockResolvedValue(
            api.success.chat.rename(mockChatId),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(mockChatId)], mockChat);
        queryClient.setQueryData([tag.userInitialChatsSearch()], [mockChat]);
        queryClient.removeQueries({ queryKey: [tag.userChats()] });
    },
    afterEach: () => {
        mocked(updateChatTitle).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(mockChatId)], mockChat);
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
    await waitFor(() => {
        const link = canvas.getByRole("link");
        expect(link).toBeVisible();
        expect(link).toHaveTextContent("My Chat Conversation");
    });
});

Default.test("should have correct href", async ({ canvas }) => {
    const link = canvas.getByRole("link");
    expect(link).toHaveAttribute("href", `/chat/${mockChatId}`);
});

Default.test("should be interactive", async ({ canvas, userEvent }) => {
    await waitFor(() => {
        const link = canvas.getByRole("link");
        expect(link).toBeVisible();
        expect(link).toBeEnabled();
    });

    const link = canvas.getByRole("link");

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
    await waitFor(() => {
        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeVisible();
    });

    const button = canvas.getByRole("button", { name: "Open menu" });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");

    await waitFor(() => {
        const menuItems = document.querySelectorAll("[role='menuitem']");
        expect(menuItems.length).toBeGreaterThan(0);
    });
});

Default.test("should render rename input", async ({ canvas, userEvent }) => {
    await waitFor(() => {
        const listItem = canvas.getByRole("listitem");
        expect(listItem).toBeVisible();
    });

    const button = canvas.getByRole("button", { name: "Open menu" });
    await userEvent.click(button);

    const renameItem = await waitFor(() => {
        const menuItems = document.querySelectorAll("[role='menuitem']");
        return Array.from(menuItems).find(item =>
            item.textContent?.includes("Rename"),
        );
    });

    await userEvent.click(renameItem!);

    const input = canvas.getByRole("textbox");
    expect(input).toBeVisible();
    expect(input).toHaveFocus();
    expect(input).toHaveValue("My Chat Conversation");
});

Default.test(
    "should rename when clicking outside input",
    async ({ canvas, userEvent }) => {
        mocked(updateChatTitle).mockResolvedValueOnce(
            api.success.chat.rename(mockChatId),
        );

        await waitFor(() => {
            const listItem = canvas.getByRole("listitem");
            expect(listItem).toBeVisible();
        });

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitFor(() => {
            const menuItems = document.querySelectorAll("[role='menuitem']");
            return Array.from(menuItems).find(item =>
                item.textContent?.includes("Rename"),
            );
        });
        await userEvent.click(renameItem!);

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
            chatId: mockChatId,
            newTitle: "New Chat Title",
        });
    },
);

Default.test(
    "should rename when pressing Enter",
    async ({ canvas, userEvent }) => {
        mocked(updateChatTitle).mockResolvedValueOnce(
            api.success.chat.rename(mockChatId),
        );

        await waitFor(() => {
            const listItem = canvas.getByRole("listitem");
            expect(listItem).toBeVisible();
        });

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitFor(() => {
            const menuItems = document.querySelectorAll("[role='menuitem']");
            return Array.from(menuItems).find(item =>
                item.textContent?.includes("Rename"),
            );
        });
        await userEvent.click(renameItem!);

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
            chatId: mockChatId,
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

        await waitFor(() => {
            const listItem = canvas.getByRole("listitem");
            expect(listItem).toBeVisible();
        });

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitFor(() => {
            const menuItems = document.querySelectorAll("[role='menuitem']");
            return Array.from(menuItems).find(item =>
                item.textContent?.includes("Rename"),
            );
        });
        await userEvent.click(renameItem!);

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
            expect(link).toHaveTextContent("My Chat Conversation");
        });

        expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    },
);

Default.test(
    "should cancel rename when pressing Escape",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const listItem = canvas.getByRole("listitem");
            expect(listItem).toBeVisible();
        });

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitFor(() => {
            const menuItems = document.querySelectorAll("[role='menuitem']");
            return Array.from(menuItems).find(item =>
                item.textContent?.includes("Rename"),
            );
        });
        await userEvent.click(renameItem!);

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
            expect(link).toHaveTextContent("My Chat Conversation");
        });

        expect(mocked(updateChatTitle)).not.toHaveBeenCalled();
    },
);

Default.test(
    "should not trigger request when renamed to same value",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const listItem = canvas.getByRole("listitem");
            expect(listItem).toBeVisible();
        });

        const button = canvas.getByRole("button", { name: "Open menu" });
        await userEvent.click(button);

        const renameItem = await waitFor(() => {
            const menuItems = document.querySelectorAll("[role='menuitem']");
            return Array.from(menuItems).find(item =>
                item.textContent?.includes("Rename"),
            );
        });
        await userEvent.click(renameItem!);

        const input = canvas.getByRole("textbox");
        await userEvent.clear(input);
        await userEvent.type(input, "My Chat Conversation");

        await userEvent.type(input, "{Enter}");

        expect(mocked(updateChatTitle)).not.toHaveBeenCalled();

        expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    },
);

export const Active = meta.story({
    name: "Active",
    args: {
        chatId: mockChatId,
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
    await waitFor(() => {
        const link = canvas.getByRole("link");
        expect(link).toHaveAttribute("data-active", "true");
        expect(link).toHaveAttribute("aria-current", "page");
    });
});

export const WithoutInitialData = meta.story({
    name: "Without Initial Data",
    args: {
        chatId: "11" as DBChatId,
        initialData: undefined,
        isActive: false,
    },
    parameters: {
        msw: {
            handlers: [
                http.get(`/api/user-chats/11`, () => {
                    const response = api.success.chat.get(
                        {
                            id: "11",
                            title: "My API Chat Conversation",
                            visibility: CHAT_VISIBILITY.PRIVATE,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            visibleAt: new Date().toISOString(),
                            isOwner: true,
                        },
                        { count: 1 },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
});

WithoutInitialData.test(
    "should fetch chat data when initialData is not provided",
    async ({ canvas }) => {
        await waitFor(() => {
            const link = canvas.getByRole("link");
            expect(link).toBeVisible();
            expect(link).toHaveTextContent("My API Chat Conversation");
        });
    },
);

export const LongTitle = meta.story({
    name: "Long Title",
    args: {
        chatId: "chat-2" as DBChatId,
        isActive: false,
        initialData: {
            ...mockChat,
            title: "This is a very long chat title that should be truncated when displayed in the sidebar",
        },
    },
});

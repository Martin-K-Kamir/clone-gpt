import preview from "#.storybook/preview";
import { QueryProvider, getQueryClient } from "@/providers/query-provider";
import { HttpResponse, http } from "msw";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, UIChat } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
import { updateChatVisibility } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";

import { ChatShareDialog, ChatShareDialogTrigger } from "./chat-share-dialog";

const stableDate = new Date("2025-01-01").toISOString();
const mockChatId = "chat-1" as DBChatId;

const mockPrivateChat: UIChat = {
    id: mockChatId,
    title: "My Private Chat",
    visibility: CHAT_VISIBILITY.PRIVATE,
    createdAt: stableDate,
    updatedAt: stableDate,
    visibleAt: stableDate,
};

const mockPublicChat: UIChat = {
    id: "chat-2" as DBChatId,
    title: "My Public Chat",
    visibility: CHAT_VISIBILITY.PUBLIC,
    createdAt: stableDate,
    updatedAt: stableDate,
    visibleAt: stableDate,
};

const mockedSharedChats = [
    {
        id: "chat-1" as DBChatId,
        title: "Shared Chat 1",
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: stableDate,
        updatedAt: stableDate,
        visibleAt: stableDate,
    },
    {
        id: "chat-2" as DBChatId,
        title: "Shared Chat 2",
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: stableDate,
        updatedAt: stableDate,
        visibleAt: stableDate,
    },
    {
        id: "chat-3" as DBChatId,
        title: "Shared Chat 3",
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: stableDate,
        updatedAt: stableDate,
        visibleAt: stableDate,
    },
];

const mockedSharedChats2 = [...mockedSharedChats];

const meta = preview.meta({
    component: ChatShareDialog,
    args: {
        chat: mockPrivateChat,
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
            description: "The chat object to share",
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
    name: "Default (Private Chat)",
    render: args => (
        <ChatShareDialog {...args}>
            <ChatShareDialogTrigger asChild>
                <Button>Share Chat</Button>
            </ChatShareDialogTrigger>
        </ChatShareDialog>
    ),
    beforeEach: () => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            }),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(mockChatId)], mockPrivateChat);
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
    afterEach: () => {
        mocked(updateChatVisibility).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(mockChatId)], mockPrivateChat);
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
});

Default.test("should open dialog", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /share chat/i });
    await userEvent.click(trigger);

    const dialog = await waitFor(() =>
        document.querySelector('[role="dialog"]'),
    );
    expect(dialog).toBeInTheDocument();
});

Default.test(
    "should show private chat state by default",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector(
                '[role="switch"][aria-checked="false"]',
            );
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });
        expect(switchElement).toBeInTheDocument();
        expect(switchElement).toHaveAttribute("aria-checked", "false");
    },
);

Default.test(
    "should have disabled copy input when chat is private",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const input = await waitFor(() =>
            document.querySelector('input[type="text"]'),
        );

        const copyInputButton = await waitFor(() => {
            const buttons = document.querySelectorAll("button");
            return Array.from(buttons).find(
                button => button.textContent === "Copy Link",
            );
        });

        expect(input).toBeInTheDocument();
        expect(input).toBeDisabled();
        expect(copyInputButton).toBeInTheDocument();
        expect(copyInputButton).toBeDisabled();

        try {
            await userEvent.click(copyInputButton!);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(input!);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    },
);

Default.test(
    "should have disabled socials when chat is private",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const linkedInButton = await waitFor(() => {
            const links = document.querySelectorAll("a");
            return Array.from(links).find(link => {
                const srOnly = link.querySelector("span.sr-only");
                return srOnly?.textContent === "Share on LinkedIn";
            });
        });

        const twitterButton = await waitFor(() => {
            const links = document.querySelectorAll("a");
            return Array.from(links).find(link => {
                const srOnly = link.querySelector("span.sr-only");
                return srOnly?.textContent === "Share on Twitter";
            });
        });

        const redditButton = await waitFor(() => {
            const links = document.querySelectorAll("a");
            return Array.from(links).find(link => {
                const srOnly = link.querySelector("span.sr-only");
                return srOnly?.textContent === "Share on Reddit";
            });
        });

        const nativeShareButton = await waitFor(() => {
            const buttons = document.querySelectorAll("button");
            return Array.from(buttons).find(button => {
                const srOnly = button.querySelector("span.sr-only");
                return srOnly?.textContent === "Share";
            });
        });

        expect(linkedInButton).toBeInTheDocument();
        expect(linkedInButton).toHaveAttribute("disabled");
        expect(twitterButton).toBeInTheDocument();
        expect(twitterButton).toHaveAttribute("disabled");
        expect(redditButton).toBeInTheDocument();
        expect(redditButton).toHaveAttribute("disabled");
        expect(nativeShareButton).toBeInTheDocument();
        expect(nativeShareButton).toBeDisabled();

        try {
            await userEvent.click(linkedInButton!);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(twitterButton!);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(redditButton!);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(nativeShareButton!);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    },
);

Default.test(
    "should toggle visibility from private to public",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);

        expect(switchElement).toHaveAttribute("aria-checked", "true");

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: mockChatId,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });
    },
);

Default.test(
    "should enable copy input when chat becomes public",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: mockChatId,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const input = await waitFor(() => {
            const inputElement = document.querySelector(
                'input[type="text"]',
            ) as HTMLInputElement;
            if (!inputElement || inputElement.disabled) {
                throw new Error("Input not found or still disabled");
            }
            return inputElement;
        });

        const copyInputButton = await waitFor(() => {
            const buttons = document.querySelectorAll("button");
            const button = Array.from(buttons).find(
                button => button.textContent === "Copy Link",
            );
            if (!button || button.disabled) {
                throw new Error("Copy button not found or still disabled");
            }
            return button;
        });

        expect(input).toBeInTheDocument();
        expect(input).not.toBeDisabled();
        expect(copyInputButton).toBeInTheDocument();
        expect(copyInputButton).not.toBeDisabled();

        await userEvent.click(copyInputButton);
        await userEvent.click(input);
    },
);

Default.test(
    "should enable socials when chat becomes public",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: mockChatId,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const linkedInButton = await waitFor(() => {
            const links = document.querySelectorAll("a");
            const link = Array.from(links).find(link => {
                const srOnly = link.querySelector("span.sr-only");
                return srOnly?.textContent === "Share on LinkedIn";
            });
            if (!link || link.hasAttribute("disabled")) {
                throw new Error("LinkedIn button not found or still disabled");
            }
            return link;
        });

        const twitterButton = await waitFor(() => {
            const links = document.querySelectorAll("a");
            const link = Array.from(links).find(link => {
                const srOnly = link.querySelector("span.sr-only");
                return srOnly?.textContent === "Share on Twitter";
            });
            if (!link || link.hasAttribute("disabled")) {
                throw new Error("Twitter button not found or still disabled");
            }
            return link;
        });

        const redditButton = await waitFor(() => {
            const links = document.querySelectorAll("a");
            const link = Array.from(links).find(link => {
                const srOnly = link.querySelector("span.sr-only");
                return srOnly?.textContent === "Share on Reddit";
            });
            if (!link || link.hasAttribute("disabled")) {
                throw new Error("Reddit button not found or still disabled");
            }
            return link;
        });

        const nativeShareButton = await waitFor(() => {
            const buttons = document.querySelectorAll("button");
            const button = Array.from(buttons).find(button => {
                const srOnly = button.querySelector("span.sr-only");
                return srOnly?.textContent === "Share";
            });
            if (!button || button.disabled) {
                throw new Error(
                    "Native share button not found or still disabled",
                );
            }
            return button;
        });

        expect(linkedInButton).toBeInTheDocument();
        expect(linkedInButton).not.toHaveAttribute("disabled");
        expect(twitterButton).toBeInTheDocument();
        expect(twitterButton).not.toHaveAttribute("disabled");
        expect(redditButton).toBeInTheDocument();
        expect(redditButton).not.toHaveAttribute("disabled");
        expect(nativeShareButton).toBeInTheDocument();
        expect(nativeShareButton).not.toBeDisabled();
    },
);

Default.test(
    "should revert to previous state when visibility update fails",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValueOnce(
            api.error.chat.visibility(
                new Error("Failed to update visibility"),
                {
                    visibility: CHAT_VISIBILITY.PUBLIC,
                    count: PLURAL.SINGLE,
                },
            ),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(switchElement).toHaveAttribute("aria-checked", "false");
        });
    },
);

Default.test(
    "should display shareable chat URL in copy input when public",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        await userEvent.click(switchElement);

        await waitFor(() => {
            const input = document.querySelector(
                'input[type="text"]',
            ) as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input.value).toContain(`/chat/${mockChatId}`);
        });
    },
);

Default.test(
    "should debounce visibility toggle updates",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);
        expect(mocked(updateChatVisibility)).not.toHaveBeenCalled();
        await userEvent.click(switchElement);
        expect(mocked(updateChatVisibility)).not.toHaveBeenCalled();
        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should not call API when toggling back to original visibility state",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);
        expect(mocked(updateChatVisibility)).not.toHaveBeenCalled();
        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).not.toHaveBeenCalled();
        });
    },
);

Default.test(
    "should open shared chats management dialog",
    {
        parameters: {
            msw: {
                handlers: [
                    http.get("/api/user-chats/shared", () => {
                        const response = api.success.chat.getShared(
                            {
                                data: mockedSharedChats,
                                hasNextPage: false,
                                totalCount: mockedSharedChats.length,
                            },
                            { count: PLURAL.MULTIPLE },
                        );
                        return HttpResponse.json(response);
                    }),
                ],
            },
        },
    },
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const sharedChatsDialogTrigger = await waitFor(() => {
            const buttons = document.querySelectorAll("button");
            return Array.from(buttons).find(button => {
                return button.textContent === "here";
            });
        });
        expect(sharedChatsDialogTrigger).toBeInTheDocument();
        await userEvent.click(sharedChatsDialogTrigger!);

        const sharedChatsTable = await waitFor(() =>
            document.querySelector("table"),
        );
        expect(sharedChatsTable).toBeInTheDocument();
    },
);

Default.test(
    "should display chat in shared chats table after making it public",
    {
        parameters: {
            msw: {
                handlers: [
                    http.get("/api/user-chats/shared", () => {
                        const response = api.success.chat.getShared(
                            {
                                data: mockedSharedChats2,
                                hasNextPage: false,
                                totalCount: mockedSharedChats2.length,
                            },
                            { count: PLURAL.MULTIPLE },
                        );
                        return HttpResponse.json(response);
                    }),
                ],
            },
        },
    },
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockImplementation(async () => {
            mockedSharedChats2.push({
                id: "chat-4" as DBChatId,
                title: "New Shared Chat",
                visibility: CHAT_VISIBILITY.PUBLIC,
                createdAt: stableDate,
                updatedAt: stableDate,
                visibleAt: stableDate,
            });
            return api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: mockChatId,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const sharedChatsDialogTrigger = await waitFor(() => {
            const buttons = document.querySelectorAll("button");
            return Array.from(buttons).find(button => {
                return button.textContent === "here";
            });
        });
        expect(sharedChatsDialogTrigger).toBeInTheDocument();
        await userEvent.click(sharedChatsDialogTrigger!);

        const sharedChatsTable = await waitFor(() =>
            document.querySelector("table"),
        );
        expect(sharedChatsTable).toBeInTheDocument();

        await waitFor(() => {
            const links = document.querySelectorAll("a");
            const myChatLink = Array.from(links).find(link => {
                return link.textContent === "New Shared Chat";
            });
            expect(myChatLink).toBeInTheDocument();
        });

        mockedSharedChats2.pop();
    },
);

Default.test(
    "should show error toast when visibility update fails",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValueOnce(
            api.error.chat.visibility(
                new Error("Failed to update visibility"),
                {
                    count: PLURAL.SINGLE,
                    visibility: CHAT_VISIBILITY.PUBLIC,
                },
            ),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(switchElement).toHaveAttribute("aria-checked", "false");
        });

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
    },
);

export const PublicChat = meta.story({
    name: "Public Chat",
    args: {
        chat: mockPublicChat,
    },
    render: args => (
        <ChatShareDialog {...args}>
            <ChatShareDialogTrigger asChild>
                <Button>Share Chat</Button>
            </ChatShareDialogTrigger>
        </ChatShareDialog>
    ),
    beforeEach: () => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PRIVATE, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );

        const queryClient = getQueryClient();
        queryClient.setQueryData(
            [tag.userChat("chat-2" as DBChatId)],
            mockPublicChat,
        );
        // Clear shared chats cache
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
    afterEach: () => {
        mocked(updateChatVisibility).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData(
            [tag.userChat("chat-2" as DBChatId)],
            mockPublicChat,
        );
        // Clear shared chats cache
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
});

PublicChat.test(
    "should show public chat state by default",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector(
                '[role="switch"][aria-checked="true"]',
            );
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });
        expect(switchElement).toHaveAttribute("aria-checked", "true");
    },
);

PublicChat.test(
    "should toggle visibility from public to private",
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockResolvedValue(
            api.success.chat.visibility(CHAT_VISIBILITY.PRIVATE, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        const switchElement = await waitFor(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (!switchBtn) {
                throw new Error("Switch not found");
            }
            return switchBtn;
        });

        expect(switchElement).toHaveAttribute("aria-checked", "true");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(switchElement).toHaveAttribute("aria-checked", "false");
        });

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: "chat-2",
                visibility: CHAT_VISIBILITY.PRIVATE,
            });
        });
    },
);

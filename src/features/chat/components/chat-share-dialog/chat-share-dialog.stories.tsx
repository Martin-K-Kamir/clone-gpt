import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_ID,
    createMockChats,
    createMockPrivateChat,
    createMockPublicChat,
} from "#.storybook/lib/mocks/chats";
import { createSharedChatsHandler } from "#.storybook/lib/msw/handlers";
import { getQueryClient } from "#.storybook/lib/utils/query-client";
import {
    findButtonByText,
    waitForDialog,
    waitForElement,
    waitForSocialShareButton,
    waitForSonnerToast,
    waitForSwitch,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { updateChatVisibility } from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";

import { ChatShareDialog, ChatShareDialogTrigger } from "./chat-share-dialog";

const mockPrivateChat = createMockPrivateChat({ index: 0 });
const mockPublicChat = createMockPublicChat({ index: 1 });
const mockedSharedChats = createMockChats({
    length: 3,
    visibility: CHAT_VISIBILITY.PUBLIC,
});
const mockedSharedChats2 = [...mockedSharedChats];

const meta = preview.meta({
    component: ChatShareDialog,
    args: {
        chat: mockPrivateChat,
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
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockPrivateChat);
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
    afterEach: () => {
        mocked(updateChatVisibility).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockPrivateChat);
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
});

Default.test("should open dialog", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: /share chat/i });
    await userEvent.click(trigger);

    await waitForDialog("dialog");
});

Default.test(
    "should show private chat state by default",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);
        expect(switchElement).toHaveAttribute("aria-checked", "false");
    },
);

Default.test(
    "should have disabled copy input when chat is private",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const input = await waitForElement('input[type="text"]');

        const copyInputButton = await waitFor(() => {
            return findButtonByText("Copy Link");
        });

        expect(input).toBeInTheDocument();
        expect(input).toBeDisabled();
        expect(copyInputButton).toBeInTheDocument();
        expect(copyInputButton).toBeDisabled();

        try {
            await userEvent.click(copyInputButton);
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

        await waitForDialog("dialog");

        const linkedInButton = await waitForSocialShareButton("LinkedIn");
        const twitterButton = await waitForSocialShareButton("Twitter");
        const redditButton = await waitForSocialShareButton("Reddit");

        expect(linkedInButton).toHaveAttribute("disabled");
        expect(twitterButton).toHaveAttribute("disabled");
        expect(redditButton).toHaveAttribute("disabled");

        try {
            await userEvent.click(linkedInButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(twitterButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(redditButton);
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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);

        await userEvent.click(switchElement);

        expect(switchElement).toHaveAttribute("aria-checked", "true");

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: MOCK_CHAT_ID,
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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: MOCK_CHAT_ID,
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
            const button = findButtonByText("Copy Link");
            if (button.disabled) {
                throw new Error("Copy button still disabled");
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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: MOCK_CHAT_ID,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const linkedInButton = await waitForSocialShareButton("LinkedIn", {
            shouldBeEnabled: true,
        });
        const twitterButton = await waitForSocialShareButton("Twitter", {
            shouldBeEnabled: true,
        });
        const redditButton = await waitForSocialShareButton("Reddit", {
            shouldBeEnabled: true,
        });

        expect(linkedInButton).toBeInTheDocument();
        expect(linkedInButton).not.toHaveAttribute("disabled");
        expect(twitterButton).toBeInTheDocument();
        expect(twitterButton).not.toHaveAttribute("disabled");
        expect(redditButton).toBeInTheDocument();
        expect(redditButton).not.toHaveAttribute("disabled");
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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);

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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch();

        await userEvent.click(switchElement);

        await waitFor(() => {
            const input = document.querySelector(
                'input[type="text"]',
            ) as HTMLInputElement;
            expect(input).toBeInTheDocument();
            expect(input.value).toContain(`/chat/${MOCK_CHAT_ID}`);
        });
    },
);

Default.test(
    "should debounce visibility toggle updates",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);

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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(false);

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
                    createSharedChatsHandler({
                        chats: mockedSharedChats,
                        hasNextPage: false,
                    }),
                ],
            },
        },
    },
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const sharedChatsDialogTrigger = await waitFor(() => {
            return findButtonByText("here");
        });
        expect(sharedChatsDialogTrigger).toBeInTheDocument();
        await userEvent.click(sharedChatsDialogTrigger);

        const sharedChatsTable = await waitForElement("table");
        expect(sharedChatsTable).toBeInTheDocument();
    },
);

Default.test(
    "should display chat in shared chats table after making it public",
    {
        parameters: {
            msw: {
                handlers: [
                    createSharedChatsHandler({
                        chats: mockedSharedChats2,
                        hasNextPage: false,
                    }),
                ],
            },
        },
    },
    async ({ canvas, userEvent }) => {
        mocked(updateChatVisibility).mockImplementation(async () => {
            mockedSharedChats2.push(
                createMockPublicChat({
                    index: mockedSharedChats2.length,
                    title: "New Shared Chat",
                }),
            );
            return api.success.chat.visibility(CHAT_VISIBILITY.PUBLIC, {
                count: PLURAL.SINGLE,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch();

        expect(switchElement).toHaveAttribute("aria-checked", "false");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: MOCK_CHAT_ID,
                visibility: CHAT_VISIBILITY.PUBLIC,
            });
        });

        const sharedChatsDialogTrigger = await waitFor(() => {
            return findButtonByText("here");
        });
        expect(sharedChatsDialogTrigger).toBeInTheDocument();
        await userEvent.click(sharedChatsDialogTrigger!);

        const sharedChatsTable = await waitForElement("table");
        expect(sharedChatsTable).toBeInTheDocument();

        await waitFor(() => {
            const myChatLink = Array.from(
                document.querySelectorAll<HTMLElement>("a"),
            ).find(link => link.textContent === "New Shared Chat");
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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch();

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(switchElement).toHaveAttribute("aria-checked", "false");
        });

        await waitForSonnerToast();
    },
);

export const PublicChat = meta.story({
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
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockPublicChat);
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
    afterEach: () => {
        mocked(updateChatVisibility).mockClear();

        const queryClient = getQueryClient();
        queryClient.setQueryData([tag.userChat(MOCK_CHAT_ID)], mockPublicChat);
        queryClient.removeQueries({ queryKey: [tag.userSharedChats()] });
    },
});

PublicChat.test(
    "should show public chat state by default",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /share chat/i });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch(true);
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

        await waitForDialog("dialog");

        const switchElement = await waitForSwitch();

        expect(switchElement).toHaveAttribute("aria-checked", "true");

        await userEvent.click(switchElement);

        await waitFor(() => {
            expect(switchElement).toHaveAttribute("aria-checked", "false");
        });

        await waitFor(() => {
            expect(mocked(updateChatVisibility)).toHaveBeenCalledWith({
                chatId: mockPublicChat.id,
                visibility: CHAT_VISIBILITY.PRIVATE,
            });
        });
    },
);

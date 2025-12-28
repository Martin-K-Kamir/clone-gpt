import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_ASSISTANT_MESSAGE_ID,
    createMockAssistantMessageMetadata,
    createMockDownvoteResponseData,
    createMockUpvoteResponseData,
} from "#.storybook/lib/mocks/messages";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import { createQueryClient } from "#.storybook/lib/utils/query-client";
import { waitForTooltip } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import { downvoteChatMessage } from "@/features/chat/services/actions/downvote-chat-message";
import { upvoteChatMessage } from "@/features/chat/services/actions/upvote-chat-message";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { api } from "@/lib/api-response";

import { ChatMessageActionsAssistant } from "./chat-message-actions-assistant";

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatProvider
                                        userId={MOCK_USER_ID}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={MOCK_CHAT_ID}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <div className="flex min-h-[200px] items-center justify-center bg-zinc-950 p-8">
                                            <Story />
                                        </div>
                                    </ChatProvider>
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: ChatMessageActionsAssistant,
    decorators: [Story => <StoryWrapper Story={Story} />],
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata(),
    },
    beforeEach: () => {
        mocked(upvoteChatMessage).mockResolvedValue(
            api.success.chat.upvote(createMockUpvoteResponseData()) as any,
        );
        mocked(downvoteChatMessage).mockResolvedValue(
            api.success.chat.downvote(createMockDownvoteResponseData()) as any,
        );
    },
});

export const Default = meta.story({});

Default.test("should render all action buttons", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const regenerateButton = canvas.getByRole("button", {
        name: /try again/i,
    });
    const upvoteButton = canvas.getByRole("button", { name: /upvote/i });
    const downvoteButton = canvas.getByRole("button", {
        name: /downvote/i,
    });

    expect(copyButton).toBeInTheDocument();
    expect(regenerateButton).toBeInTheDocument();
    expect(upvoteButton).toBeInTheDocument();
    expect(downvoteButton).toBeInTheDocument();
});

Default.test("should show tooltips on hover", async ({ canvas, userEvent }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    await userEvent.hover(copyButton);

    const tooltip = await waitForTooltip();
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Copy");
});

Default.test(
    "should copy content when copy button is clicked",
    async ({ canvas, userEvent, args }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        await userEvent.click(copyButton);

        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            expect(clipboardText).toBe(args.content);
        }
    },
);

Default.test(
    "should upvote message when upvote button is clicked",
    async ({ canvas, userEvent }) => {
        const upvoteButton = canvas.getByRole("button", { name: /upvote/i });
        await userEvent.click(upvoteButton);

        await waitFor(() => {
            expect(mocked(upvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                upvote: true,
            });
        });
    },
);

Default.test(
    "should downvote message when downvote button is clicked",
    async ({ canvas, userEvent }) => {
        const downvoteButton = canvas.getByRole("button", {
            name: /downvote/i,
        });
        await userEvent.click(downvoteButton);

        await waitFor(() => {
            expect(mocked(downvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                downvote: true,
            });
        });
    },
);

export const Upvoted = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata({
            isUpvoted: true,
            isDownvoted: false,
        }),
    },
});

Upvoted.test("should show upvoted state", async ({ canvas }) => {
    const upvoteButton = canvas.getByRole("button", { name: /upvoted/i });
    expect(upvoteButton).toBeInTheDocument();
});

Upvoted.test(
    "should remove upvote when clicked again",
    async ({ canvas, userEvent }) => {
        const upvoteButton = canvas.getByRole("button", { name: /upvoted/i });
        await userEvent.click(upvoteButton);

        await waitFor(() => {
            expect(mocked(upvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                upvote: false,
            });
        });
    },
);

export const Downvoted = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata({
            isUpvoted: false,
            isDownvoted: true,
        }),
    },
});

Downvoted.test("should show downvoted state", async ({ canvas }) => {
    const downvoteButton = canvas.getByRole("button", { name: /downvoted/i });
    expect(downvoteButton).toBeInTheDocument();
});

Downvoted.test(
    "should remove downvote when clicked again",
    async ({ canvas, userEvent }) => {
        const downvoteButton = canvas.getByRole("button", {
            name: /downvoted/i,
        });
        await userEvent.click(downvoteButton);

        await waitFor(() => {
            expect(mocked(downvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                downvote: false,
            });
        });
    },
);

export const Disabled = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata(),
        disabled: true,
    },
});

Disabled.test("should disable all buttons", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const regenerateButton = canvas.getByRole("button", {
        name: /try again/i,
    });
    const upvoteButton = canvas.getByRole("button", { name: /upvote/i });
    const downvoteButton = canvas.getByRole("button", {
        name: /downvote/i,
    });

    expect(copyButton).toBeDisabled();
    expect(regenerateButton).toBeDisabled();
    expect(upvoteButton).toBeDisabled();
    expect(downvoteButton).toBeDisabled();
});

Disabled.test(
    "should not trigger actions when disabled",
    async ({ canvas, userEvent }) => {
        const upvoteButton = canvas.getByRole("button", { name: /upvote/i });
        const downvoteButton = canvas.getByRole("button", {
            name: /downvote/i,
        });
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const regenerateButton = canvas.getByRole("button", {
            name: /try again/i,
        });

        try {
            await userEvent.click(upvoteButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await waitFor(() => {
            expect(mocked(upvoteChatMessage)).not.toHaveBeenCalled();
        });

        try {
            await userEvent.click(downvoteButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await waitFor(() => {
            expect(mocked(downvoteChatMessage)).not.toHaveBeenCalled();
        });

        try {
            await userEvent.click(copyButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(regenerateButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    },
);

export const WithoutCopy = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata(),
        showCopy: false,
    },
});

WithoutCopy.test("should not show copy button", async ({ canvas }) => {
    const copyButton = canvas.queryByRole("button", { name: /copy/i });
    const regenerateButton = canvas.getByRole("button", {
        name: /try again/i,
    });

    expect(copyButton).not.toBeInTheDocument();
    expect(regenerateButton).toBeInTheDocument();
});

export const WithoutRegenerate = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata(),
        showRegenerate: false,
    },
});

WithoutRegenerate.test(
    "should not show regenerate button",
    async ({ canvas }) => {
        const regenerateButton = canvas.queryByRole("button", {
            name: /try again/i,
        });
        const copyButton = canvas.getByRole("button", { name: /copy/i });

        expect(regenerateButton).not.toBeInTheDocument();
        expect(copyButton).toBeInTheDocument();
    },
);

export const WithoutVotes = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        metadata: createMockAssistantMessageMetadata(),
        showUpvote: false,
        showDownvote: false,
    },
});

WithoutVotes.test("should not show vote buttons", async ({ canvas }) => {
    const upvoteButton = canvas.queryByRole("button", {
        name: /upvote/i,
    });
    const downvoteButton = canvas.queryByRole("button", {
        name: /downvote/i,
    });
    const copyButton = canvas.getByRole("button", { name: /copy/i });

    expect(upvoteButton).not.toBeInTheDocument();
    expect(downvoteButton).not.toBeInTheDocument();
    expect(copyButton).toBeInTheDocument();
});

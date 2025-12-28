import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_ASSISTANT_MESSAGE_ID,
    MOCK_ASSISTANT_MESSAGE_PARTS_WITH_SOURCES,
    createMockAssistantMessageMetadata,
    createMockDownvoteResponseData,
    createMockTextMessagePart,
    createMockUpvoteResponseData,
} from "#.storybook/lib/mocks/messages";
import { createMockMessagesRateLimit } from "#.storybook/lib/mocks/rate-limits";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import { createQueryClient } from "#.storybook/lib/utils/query-client";
import { waitForDialog } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { expect, mocked } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import { downvoteChatMessage } from "@/features/chat/services/actions/downvote-chat-message";
import { upvoteChatMessage } from "@/features/chat/services/actions/upvote-chat-message";

import type { UserMessagesRateLimitResult } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";

import { ChatMessageToolbarAssistant } from "./chat-message-toolbar-assistant";

const StoryWrapper = ({
    Story,
    isOwner = true,
    rateLimit = null,
    isRateLimitPending = false,
}: {
    Story: React.ComponentType;
    isOwner?: boolean;
    rateLimit?: UserMessagesRateLimitResult | null;
    isRateLimitPending?: boolean;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    useEffect(() => {
        if (rateLimit !== undefined && rateLimit !== null) {
            queryClient.setQueryData(
                [tag.userMessagesRateLimit(MOCK_USER_ID)],
                rateLimit,
            );
        } else if (rateLimit === null) {
            queryClient.setQueryData(
                [tag.userMessagesRateLimit(MOCK_USER_ID)],
                {
                    isOverLimit: false,
                    tokensCounter: 0,
                    messagesCounter: 0,
                } as UserMessagesRateLimitResult,
            );
        }

        if (isRateLimitPending) {
            queryClient.setQueryData(
                [tag.userMessagesRateLimit(MOCK_USER_ID)],
                undefined,
            );
        }
    }, [queryClient, rateLimit, isRateLimitPending]);

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
                                        isOwner={isOwner}
                                        chatId={MOCK_CHAT_ID}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <div className="group/message flex min-h-[200px] items-center justify-center bg-zinc-950 p-8">
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
    component: ChatMessageToolbarAssistant,
    decorators: [Story => <StoryWrapper Story={Story} />],
    args: {
        canShowActions: true,
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        parts: [
            createMockTextMessagePart(
                "This is a sample assistant message that can be copied, regenerated, and voted on.",
            ),
        ],
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
    argTypes: {
        canShowActions: {
            control: "boolean",
            description: "Whether to show the toolbar",
        },
        chatId: {
            control: false,
            description: "The chat ID",
        },
        messageId: {
            control: false,
            description: "The message ID",
        },
        content: {
            control: "text",
            description: "The message content",
        },
        parts: {
            control: false,
            description: "The message parts",
        },
        metadata: {
            control: false,
            description: "The message metadata",
        },
        disabled: {
            control: "boolean",
            description: "Whether all action buttons are disabled",
        },
    },
});

export const Default = meta.story({});

export const NotOwner = meta.story({
    decorators: [Story => <StoryWrapper Story={Story} isOwner={false} />],
});

NotOwner.test(
    "should not show regenerate and vote buttons when user is not owner",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const regenerateButton = canvas.queryByRole("button", {
            name: /try again/i,
        });
        const upvoteButton = canvas.queryByRole("button", {
            name: /upvote/i,
        });
        const downvoteButton = canvas.queryByRole("button", {
            name: /downvote/i,
        });

        expect(copyButton).toBeInTheDocument();
        expect(regenerateButton).not.toBeInTheDocument();
        expect(upvoteButton).not.toBeInTheDocument();
        expect(downvoteButton).not.toBeInTheDocument();
    },
);

export const RateLimitExceeded = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                rateLimit={createMockMessagesRateLimit({
                    tokensCounter: 1000,
                    messagesCounter: 100,
                })}
                isOwner={true}
            />
        ),
    ],
});

RateLimitExceeded.test(
    "should not show regenerate button when rate limit is exceeded",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const regenerateButton = canvas.queryByRole("button", {
            name: /try again/i,
        });
        const upvoteButton = canvas.getByRole("button", {
            name: /upvote/i,
        });

        expect(copyButton).toBeInTheDocument();
        expect(regenerateButton).not.toBeInTheDocument();
        expect(upvoteButton).toBeInTheDocument();
    },
);

export const Disabled = meta.story({
    args: {
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

export const WithSources = meta.story({
    args: {
        parts: MOCK_ASSISTANT_MESSAGE_PARTS_WITH_SOURCES,
    },
});

WithSources.test(
    "should show image icons of the sources",
    async ({ canvas }) => {
        const sourceIcons = canvas.getAllByRole("img");
        expect(sourceIcons.length).toBeGreaterThan(0);
    },
);

WithSources.test(
    "should open source dialog when source button is clicked",
    async ({ canvas, userEvent }) => {
        const sourceButton = canvas.getByRole("button", {
            name: /sources/i,
        });
        await userEvent.click(sourceButton);

        await waitForDialog("dialog");
    },
);

export const Hidden = meta.story({
    args: {
        canShowActions: false,
    },
});

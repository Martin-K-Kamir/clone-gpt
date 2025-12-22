import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { expect, mocked, userEvent, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_MESSAGE_TYPE, CHAT_TOOL } from "@/features/chat/lib/constants";
import type {
    DBChatId,
    DBChatMessageId,
    UIAssistantChatMessage,
} from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import { downvoteChatMessage } from "@/features/chat/services/actions/downvote-chat-message";
import { upvoteChatMessage } from "@/features/chat/services/actions/upvote-chat-message";

import type { DBUserId } from "@/features/user/lib/types";
import type { UserMessagesRateLimitResult } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { ChatMessageToolbarAssistant } from "./chat-message-toolbar-assistant";

const mockChatId = "chat-123" as DBChatId;
const mockMessageId = "00000000-0000-0000-0000-000000000002" as DBChatMessageId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

function createMockMetadata(overrides?: {
    isUpvoted?: boolean;
    isDownvoted?: boolean;
}) {
    return {
        role: "assistant" as const,
        createdAt: "2024-01-15T12:00:00.000Z",
        model: "gpt-4",
        totalTokens: 100,
        isUpvoted: false,
        isDownvoted: false,
        ...overrides,
    };
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                staleTime: 60 * 1000,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            },
        },
    });
}

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
                [tag.userMessagesRateLimit(mockUserId)],
                rateLimit,
            );
        } else if (rateLimit === null) {
            // Set default rate limit (not over limit)
            queryClient.setQueryData([tag.userMessagesRateLimit(mockUserId)], {
                isOverLimit: false,
                tokensCounter: 0,
                messagesCounter: 0,
            } as UserMessagesRateLimitResult);
        }

        if (isRateLimitPending) {
            queryClient.setQueryData(
                [tag.userMessagesRateLimit(mockUserId)],
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
                                        userId={mockUserId}
                                        isNewChat={false}
                                        isOwner={isOwner}
                                        chatId={mockChatId}
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
        chatId: mockChatId,
        messageId: mockMessageId,
        content:
            "This is a sample assistant message that can be copied, regenerated, and voted on.",
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "This is a sample assistant message that can be copied, regenerated, and voted on.",
            },
        ] as UIAssistantChatMessage["parts"],
        metadata: createMockMetadata(),
    },
    beforeEach: () => {
        mocked(upvoteChatMessage).mockResolvedValue(
            api.success.chat.upvote({
                id: mockMessageId,
                chatId: mockChatId,
                userId: mockUserId,
                role: "assistant" as const,
                content: "",
                createdAt: new Date().toISOString(),
                metadata: createMockMetadata({ isUpvoted: true }),
                parts: [],
            }),
        );
        mocked(downvoteChatMessage).mockResolvedValue(
            api.success.chat.downvote({
                id: mockMessageId,
                chatId: mockChatId,
                userId: mockUserId,
                role: "assistant" as const,
                content: "",
                createdAt: new Date().toISOString(),
                metadata: createMockMetadata({ isDownvoted: true }),
                parts: [],
            }),
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
        await waitFor(() => {
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
        });
    },
);

export const RateLimitExceeded = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                rateLimit={{
                    isOverLimit: true,
                    reason: RATE_LIMIT_REASON.MESSAGES,
                    periodStart: new Date().toISOString(),
                    periodEnd: new Date(
                        Date.now() + 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    tokensCounter: 1000,
                    messagesCounter: 100,
                }}
                isOwner={true}
            />
        ),
    ],
});

RateLimitExceeded.test(
    "should not show regenerate button when rate limit is exceeded",
    async ({ canvas }) => {
        await waitFor(() => {
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
        });
    },
);

export const Disabled = meta.story({
    name: "Disabled",
    args: {
        disabled: true,
    },
});

Disabled.test("should disable all buttons", async ({ canvas }) => {
    await waitFor(() => {
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
});

export const WithSources = meta.story({
    name: "With Sources",
    args: {
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "Here's some information based on the following sources:",
            },
            {
                type: "source-url",
                sourceId: "source-1",
                url: "https://github.com/vercel/next.js",
                title: "Next.js - The React Framework",
            },
            {
                type: "source-url",
                sourceId: "source-2",
                url: "https://react.dev/reference/react",
                title: "React Reference Documentation",
            },
            {
                type: "source-url",
                sourceId: "source-3",
                url: "https://tailwindcss.com/docs",
                title: "Tailwind CSS Documentation",
            },
        ] as UIAssistantChatMessage["parts"],
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

        await waitFor(() => {
            const dialog = document.querySelector(
                "[data-slot='dialog-content']",
            );
            expect(dialog).toBeInTheDocument();
        });
    },
);

export const Hidden = meta.story({
    name: "Hidden",
    args: {
        canShowActions: false,
    },
});

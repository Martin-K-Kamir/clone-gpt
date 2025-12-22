import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import { useEffect, useMemo } from "react";
import { expect, fn } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { DBChatId, UIUserChatMessage } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import type { UserMessagesRateLimitResult } from "@/features/user/lib/types";
import type { DBUserId } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { tag } from "@/lib/cache-tag";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { ChatMessageToolbarUser } from "./chat-message-toolbar-user";

const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

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
}: {
    Story: React.ComponentType;
    isOwner?: boolean;
    rateLimit?: UserMessagesRateLimitResult | null;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    useEffect(() => {
        if (rateLimit !== undefined && rateLimit !== null) {
            queryClient.setQueryData(
                [tag.userMessagesRateLimit(mockUserId)],
                rateLimit,
            );
        } else if (rateLimit === null) {
            queryClient.setQueryData([tag.userMessagesRateLimit(mockUserId)], {
                isOverLimit: false,
                tokensCounter: 0,
                messagesCounter: 0,
            } as UserMessagesRateLimitResult);
        }
    }, [queryClient, rateLimit]);

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
    component: ChatMessageToolbarUser,
    decorators: [Story => <StoryWrapper Story={Story} />],
    args: {
        canShowActions: true,
        status: "ready" as ChatStatus,
        content: "This is a sample message content that can be copied.",
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "This is a sample message content that can be copied.",
            },
        ] as UIUserChatMessage["parts"],
        onUpdate: fn(),
        className: "opacity-100",
    },
    argTypes: {
        canShowActions: {
            control: "boolean",
            description: "Whether to show the toolbar",
        },
        status: {
            control: "select",
            options: ["ready", "streaming", "submitted", "error"],
            description: "The chat status",
        },
        content: {
            control: "text",
            description: "The message content",
        },
        parts: {
            control: false,
            description: "The message parts",
        },
        onUpdate: {
            control: false,
            description:
                "Callback function called when update button is clicked",
        },
        className: {
            control: "text",
            description: "The class name for the toolbar",
        },
    },
});

export const Default = meta.story({});

Default.test(
    "should render toolbar with copy and update buttons",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.getByRole("button", { name: /update/i });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).toBeInTheDocument();
    },
);

Default.test(
    "should call onUpdate when update button is clicked",
    async ({ canvas, userEvent, args }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        expect(args.onUpdate).toHaveBeenCalledTimes(1);
    },
);

export const WithFiles = meta.story({
    name: "With Files",
    args: {
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "Here are some documents:",
            },
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "document.pdf",
                url: "https://example.com/document.pdf",
                mediaType: "application/pdf",
                size: 1024 * 500,
                extension: "pdf",
            },
        ] as UIUserChatMessage["parts"],
    },
});

WithFiles.test(
    "should not show update button when message has files",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.queryByRole("button", {
            name: /update/i,
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const WithImages = meta.story({
    name: "With Images",
    args: {
        parts: [
            {
                type: CHAT_MESSAGE_TYPE.TEXT,
                text: "Check out these images:",
            },
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo.jpg",
                url: "https://picsum.photos/id/239/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 200,
                extension: "jpg",
                width: 1920,
                height: 1080,
            },
        ] as UIUserChatMessage["parts"],
    },
});

WithImages.test(
    "should not show update button when message has images",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.queryByRole("button", {
            name: /update/i,
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const Streaming = meta.story({
    name: "Streaming",
    args: {
        status: "streaming" as ChatStatus,
    },
});

Streaming.test("should disable actions when streaming", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const updateButton = canvas.getByRole("button", { name: /update/i });

    expect(copyButton).toBeDisabled();
    expect(updateButton).toBeDisabled();
});

export const Submitted = meta.story({
    name: "Submitted",
    args: {
        status: "submitted" as ChatStatus,
    },
});

Submitted.test("should disable actions when submitted", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const updateButton = canvas.getByRole("button", { name: /update/i });

    expect(copyButton).toBeDisabled();
    expect(updateButton).toBeDisabled();
});

export const NotOwner = meta.story({
    name: "Not Owner",
    decorators: [Story => <StoryWrapper Story={Story} isOwner={false} />],
});

NotOwner.test(
    "should not show update button when user is not owner",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.queryByRole("button", {
            name: /update/i,
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const RateLimitExceeded = meta.story({
    name: "Rate Limit Exceeded",
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
            />
        ),
    ],
    parameters: {
        chromatic: { disableSnapshot: true },
    },
});

RateLimitExceeded.test(
    "should not show update button when rate limit is exceeded",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.queryByRole("button", {
            name: /update/i,
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const Hidden = meta.story({
    name: "Hidden",
    args: {
        canShowActions: false,
    },
});

Hidden.test(
    "should not render when canShowActions is false",
    async ({ canvas }) => {
        const copyButton = canvas.queryByRole("button", { name: /copy/i });
        const updateButton = canvas.queryByRole("button", { name: /update/i });

        expect(copyButton).not.toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

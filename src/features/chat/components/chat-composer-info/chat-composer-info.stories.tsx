import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import type { DBChatId } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatFilesRateLimitContext,
    ChatMessagesRateLimitContext,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import type {
    DBUserId,
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { formatDateTime } from "@/lib/utils";

import { ChatComposerInfo } from "./chat-composer-info";

const fixedDate = new Date("2025-12-22T12:00:00.000Z");
const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
}

const StoryWrapper = ({
    Story,
    rateLimitMessages,
    rateLimitFiles,
}: {
    Story: React.ComponentType;
    rateLimitMessages?: UserMessagesRateLimitResult;
    rateLimitFiles?: UserFilesRateLimitResult;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    const chatMessagesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitMessages,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitMessages],
    );

    const chatFilesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitFiles,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitFiles],
    );

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
                                        isOwner={true}
                                        chatId={mockChatId}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <ChatMessagesRateLimitContext.Provider
                                            value={
                                                chatMessagesRateLimitContextValue
                                            }
                                        >
                                            <ChatFilesRateLimitContext.Provider
                                                value={
                                                    chatFilesRateLimitContextValue
                                                }
                                            >
                                                <div className="bg-zinc-925 grid min-h-svh w-full items-center">
                                                    <div className="relative mx-auto w-full max-w-3xl">
                                                        <Story />
                                                    </div>
                                                </div>
                                            </ChatFilesRateLimitContext.Provider>
                                        </ChatMessagesRateLimitContext.Provider>
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
    component: ChatComposerInfo,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    decorators: [Story => <StoryWrapper Story={Story} />],
});

Default.test(
    "should not render rate limit info when no rate limit",
    async ({ canvas }) => {
        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).not.toBeInTheDocument();
        });
    },
);

export const WithMessagesRateLimit = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                rateLimitMessages={{
                    isOverLimit: true,
                    reason: "messages",
                    periodStart: fixedDate.toISOString(),
                    periodEnd: new Date(
                        fixedDate.getTime() + 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    messagesCounter: 100,
                    tokensCounter: 50000,
                }}
            />
        ),
    ],
});

WithMessagesRateLimit.test(
    "should show messages rate limit info",
    async ({ canvas }) => {
        await waitFor(() => {
            const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
            expect(rateLimit).toBeInTheDocument();
        });
    },
);

WithMessagesRateLimit.test(
    "should show the correct date time",
    async ({ canvas }) => {
        const periodEnd = new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000);
        await waitFor(() => {
            const dateTime = canvas.getByText(
                new RegExp(formatDateTime(periodEnd.toISOString()), "i"),
            );
            expect(dateTime).toBeInTheDocument();
        });
    },
);

WithMessagesRateLimit.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
            expect(rateLimit).toBeInTheDocument();
        });

        const closeButton = canvas.getByRole("button", {
            name: "Close rate limit info",
        });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);

        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).not.toBeInTheDocument();
        });
    },
);

export const WithFilesRateLimit = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                rateLimitFiles={{
                    isOverLimit: true,
                    reason: "files",
                    periodStart: fixedDate.toISOString(),
                    periodEnd: new Date(
                        fixedDate.getTime() + 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    filesCounter: 10,
                }}
            />
        ),
    ],
});

WithFilesRateLimit.test(
    "should show files rate limit info",
    async ({ canvas }) => {
        await waitFor(() => {
            const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
            expect(rateLimit).toBeInTheDocument();
        });
    },
);

WithFilesRateLimit.test(
    "should show the correct date time",
    async ({ canvas }) => {
        const periodEnd = new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000);
        await waitFor(() => {
            const dateTime = canvas.getByText(
                new RegExp(formatDateTime(periodEnd.toISOString()), "i"),
            );
            expect(dateTime).toBeInTheDocument();
        });
    },
);

WithFilesRateLimit.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
            expect(rateLimit).toBeInTheDocument();
        });

        const closeButton = canvas.getByRole("button", {
            name: "Close rate limit info",
        });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);

        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).not.toBeInTheDocument();
        });
    },
);

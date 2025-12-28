import { WithQueryProvider } from "#.storybook/lib/decorators/providers";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    FIXED_DATE_PLUS_24H,
    createMockFilesRateLimit,
    createMockMessagesRateLimit,
} from "#.storybook/lib/mocks/rate-limits";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import preview from "#.storybook/preview";
import { useMemo } from "react";
import type React from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatFilesRateLimitContext,
    ChatMessagesRateLimitContext,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import type {
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { formatDateTime } from "@/lib/utils";

import { ChatComposerInfo } from "./chat-composer-info";

const StoryWrapper = ({
    Story,
    rateLimitMessages,
    rateLimitFiles,
}: {
    Story: React.ComponentType;
    rateLimitMessages?: UserMessagesRateLimitResult;
    rateLimitFiles?: UserFilesRateLimitResult;
}) => {
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
    );
};

const meta = preview.meta({
    component: ChatComposerInfo,
    decorators: [
        (Story: React.ComponentType) => (
            <WithQueryProvider>
                <StoryWrapper Story={Story} />
            </WithQueryProvider>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({});

Default.test(
    "should not render rate limit info when no rate limit",
    async ({ canvas }) => {
        const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
        expect(rateLimit).not.toBeInTheDocument();
    },
);

export const WithMessagesRateLimit = meta.story({
    decorators: [
        Story => (
            <WithQueryProvider>
                <StoryWrapper
                    Story={Story}
                    rateLimitMessages={createMockMessagesRateLimit()}
                />
            </WithQueryProvider>
        ),
    ],
});

WithMessagesRateLimit.test(
    "should show messages rate limit info",
    async ({ canvas }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();
    },
);

WithMessagesRateLimit.test(
    "should show the correct date time",
    async ({ canvas }) => {
        const dateTime = canvas.getByText(
            new RegExp(formatDateTime(FIXED_DATE_PLUS_24H), "i"),
        );
        expect(dateTime).toBeInTheDocument();
    },
);

WithMessagesRateLimit.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();

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
            <WithQueryProvider>
                <StoryWrapper
                    Story={Story}
                    rateLimitFiles={createMockFilesRateLimit()}
                />
            </WithQueryProvider>
        ),
    ],
});

WithFilesRateLimit.test(
    "should show files rate limit info",
    async ({ canvas }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();
    },
);

WithFilesRateLimit.test(
    "should show the correct date time",
    async ({ canvas }) => {
        const dateTime = canvas.getByText(
            new RegExp(formatDateTime(FIXED_DATE_PLUS_24H), "i"),
        );
        expect(dateTime).toBeInTheDocument();
    },
);

WithFilesRateLimit.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();

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

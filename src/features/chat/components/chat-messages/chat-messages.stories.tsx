import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_CONVERSATION_COMPLEX,
    MOCK_CONVERSATION_MULTIPLE,
    MOCK_CONVERSATION_SIMPLE,
    MOCK_CONVERSATION_WITH_GENERATED_FILE,
    MOCK_CONVERSATION_WITH_GENERATED_FILES,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGES,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE_LANDSCAPE,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE_PORTRAIT,
    MOCK_CONVERSATION_WITH_IMAGE_ANALYSIS,
    MOCK_CONVERSATION_WITH_LONG_MESSAGES,
    MOCK_CONVERSATION_WITH_MARKDOWN,
    MOCK_CONVERSATION_WITH_MULTIPLE_FILES,
    MOCK_CONVERSATION_WITH_MULTIPLE_IMAGES,
    MOCK_CONVERSATION_WITH_SINGLE_FILE,
    MOCK_CONVERSATION_WITH_SINGLE_IMAGE,
    MOCK_CONVERSATION_WITH_WEATHER,
} from "#.storybook/lib/mocks/conversations";
import {
    MOCK_CHAT_STATUS,
    createMockAssistantMessageWithTool,
    createMockUserMessage,
} from "#.storybook/lib/mocks/messages";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import { createQueryClient } from "#.storybook/lib/utils/query-client";
import preview from "#.storybook/preview";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ChatStatus } from "ai";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_TOOL } from "@/features/chat/lib/constants";
import type { DBChatId, UIChatMessage } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
    ChatStatusContext,
} from "@/features/chat/providers";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { ChatMessages } from "./chat-messages";

const StoryWrapper = ({
    Story,
    messages = [],
    chatId = MOCK_CHAT_ID,
    status,
    error,
}: {
    Story: React.ComponentType;
    messages?: UIChatMessage[];
    chatId?: DBChatId;
    status?: ChatStatus;
    error?: Error;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    const chatStatusContextValue = useMemo(
        () =>
            status !== undefined
                ? {
                      status,
                      error,
                      isStreaming: status === MOCK_CHAT_STATUS.STREAMING,
                      isSubmitted: status === MOCK_CHAT_STATUS.SUBMITTED,
                      isReady: status === MOCK_CHAT_STATUS.READY,
                      isError: status === MOCK_CHAT_STATUS.ERROR,
                  }
                : undefined,
        [status, error],
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
                                        userId={MOCK_USER_ID}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={chatId}
                                        messages={messages}
                                        userChatPreferences={null}
                                    >
                                        {chatStatusContextValue ? (
                                            <ChatStatusContext.Provider
                                                value={chatStatusContextValue}
                                            >
                                                <div className="h-screen w-full bg-zinc-950">
                                                    <Story />
                                                </div>
                                            </ChatStatusContext.Provider>
                                        ) : (
                                            <div className="h-screen w-full bg-zinc-950">
                                                <Story />
                                            </div>
                                        )}
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
    component: ChatMessages,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
        a11y: {
            config: {
                rules: [
                    {
                        id: "color-contrast",
                        enabled: false,
                    },
                ],
            },
        },
    },
});

export const Default = meta.story({});

export const WithMessages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper Story={Story} messages={MOCK_CONVERSATION_SIMPLE} />
        ),
    ],
});

WithMessages.test(
    "should display user and assistant messages",
    async ({ canvas }) => {
        const userMessage = canvas.getByText(/hello, how can you help me\?/i);
        const assistantMessage = canvas.getByText(
            /hello! i'm here to help you\./i,
        );

        expect(userMessage).toBeInTheDocument();
        expect(assistantMessage).toBeInTheDocument();
    },
);

WithMessages.test(
    "should render messages in correct order",
    async ({ canvas }) => {
        const articles = canvas.getAllByRole("article");
        expect(articles.length).toBe(2);
        expect(articles[0]).toHaveAttribute("data-role", "user");
        expect(articles[1]).toHaveAttribute("data-role", "assistant");
    },
);

export const WithMultipleMessages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper Story={Story} messages={MOCK_CONVERSATION_MULTIPLE} />
        ),
    ],
});

WithMultipleMessages.test("should render all messages", async ({ canvas }) => {
    const articles = canvas.getAllByRole("article");
    expect(articles.length).toBe(6);
});

export const WithLongConversation = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_LONG_MESSAGES}
            />
        ),
    ],
});

WithLongConversation.test("should render all messages", async ({ canvas }) => {
    await waitFor(() => {
        const articles = canvas.getAllByRole("article");
        expect(articles.length).toBe(4);
    });
});

WithLongConversation.test(
    "should scroll to bottom on first render",
    async () => {
        // Find the scrollable container
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for auto-scroll to complete
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10; // Allow small margin for rounding

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );
    },
);

WithLongConversation.test(
    "should show scroll bottom button when scrolled up",
    async ({ canvas }) => {
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for initial scroll to bottom
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Scroll up
        scrollContainer.scrollTop = 0;

        // Wait for scroll event to process
        await waitFor(() => {
            const scrollButton = canvas.getByRole("button", {
                name: /scroll to bottom/i,
            });
            expect(scrollButton).toBeInTheDocument();
            expect(scrollButton).toBeVisible();
        });
    },
);

WithLongConversation.test(
    "should scroll to bottom when scroll bottom button is clicked",
    async ({ canvas, userEvent }) => {
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for initial scroll to bottom
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Scroll up
        scrollContainer.scrollTop = 0;

        // Wait for scroll button to appear and be clickable
        // The button has pointer-events-none when isAtBottom is true
        // We need to wait for useScrollPosition to update
        const scrollButton = await waitFor(
            () => {
                const button = canvas.getByRole("button", {
                    name: /scroll to bottom/i,
                });
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();

                // Check that pointer-events is not 'none'
                const computedStyle = window.getComputedStyle(button);
                expect(computedStyle.pointerEvents).not.toBe("none");
                expect(computedStyle.opacity).not.toBe("0");

                return button;
            },
            { timeout: 2000 },
        );

        // Click the scroll bottom button
        await userEvent.click(scrollButton);

        // Wait for smooth scroll to complete
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Button should be hidden again
        await waitFor(() => {
            const scrollButtonAfter = canvas.queryByRole("button", {
                name: /scroll to bottom/i,
            });
            // Button might still be in DOM but hidden with opacity-0
            if (scrollButtonAfter) {
                const computedStyle =
                    window.getComputedStyle(scrollButtonAfter);
                expect(computedStyle.opacity).toBe("0");
            }
        });
    },
);

export const UserWithSingleImage = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_SINGLE_IMAGE}
            />
        ),
    ],
});

export const UserWithSingleFile = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_SINGLE_FILE}
            />
        ),
    ],
});

export const UserWithMultipleImages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_MULTIPLE_IMAGES}
            />
        ),
    ],
});

export const UserWithMultipleFiles = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_MULTIPLE_FILES}
            />
        ),
    ],
});

export const AssistantWithWeather = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_WEATHER}
            />
        ),
    ],
});

export const AssistantWithGeneratedImage = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_GENERATED_IMAGE}
            />
        ),
    ],
});

export const AssistantWithGeneratedImagePortrait = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_GENERATED_IMAGE_PORTRAIT}
            />
        ),
    ],
});

export const AssistantWithGeneratedImageLandscape = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_GENERATED_IMAGE_LANDSCAPE}
            />
        ),
    ],
});

export const AssistantWithGeneratedImages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_GENERATED_IMAGES}
            />
        ),
    ],
});

export const AssistantWithGeneratedFile = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_GENERATED_FILE}
            />
        ),
    ],
});

export const AssistantWithGeneratedFiles = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_GENERATED_FILES}
            />
        ),
    ],
});

export const AssistantWithMarkdown = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_MARKDOWN}
            />
        ),
    ],
});

export const UserUploadWithAssistantResponse = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={MOCK_CONVERSATION_WITH_IMAGE_ANALYSIS}
            />
        ),
    ],
});

export const WithError = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage({ text: "This will cause an error" }),
                ]}
                status={MOCK_CHAT_STATUS.ERROR}
                error={new Error("Failed to process request")}
            />
        ),
    ],
});

WithError.test("should show error message", async ({ canvas }) => {
    const errorMessage = canvas.getByText(
        /something went wrong\. please try again\./i,
    );
    expect(errorMessage).toBeInTheDocument();
});

export const WithLoading = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                messages={[
                    createMockUserMessage({
                        text: "What's the weather in New York?",
                    }),
                    createMockAssistantMessageWithTool(CHAT_TOOL.GET_WEATHER),
                ]}
                status={MOCK_CHAT_STATUS.STREAMING}
            />
        ),
    ],
});

WithLoading.test(
    "should show loader with tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const loader = canvas.getByRole("status", { hidden: true });
            expect(loader).toBeInTheDocument();
        });

        await waitFor(() => {
            const toolDescription = canvas.getByText(
                /getting the weather\.\.\./i,
            );
            expect(toolDescription).toBeInTheDocument();
        });
    },
);

export const ComplexConversation = meta.story({
    decorators: [
        Story => (
            <StoryWrapper Story={Story} messages={MOCK_CONVERSATION_COMPLEX} />
        ),
    ],
});

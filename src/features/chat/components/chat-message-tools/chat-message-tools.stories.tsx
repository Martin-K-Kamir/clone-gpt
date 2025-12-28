import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_TOOL_PARTS_GENERATE_FILE,
    MOCK_TOOL_PARTS_GENERATE_IMAGE,
    MOCK_TOOL_PARTS_WEATHER,
} from "#.storybook/lib/mocks/messages";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import { createQueryClient } from "#.storybook/lib/utils/query-client";
import preview from "#.storybook/preview";
import { QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { ChatMessageTools } from "./chat-message-tools";

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
                                        <Story />
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
    component: ChatMessageTools,
    decorators: [Story => <StoryWrapper Story={Story} />],
    args: {
        parts: [],
    },
    argTypes: {
        parts: {
            control: false,
            description: "The message parts containing tool outputs",
        },
    },
});

export const Default = meta.story({});

Default.test("should render nothing when no tool parts", async ({ canvas }) => {
    const tools = canvas.queryByTestId("chat-message-tools");
    expect(tools?.children.length).toBe(0);
});

export const WithWeatherTool = meta.story({
    args: {
        parts: MOCK_TOOL_PARTS_WEATHER,
    },
    parameters: {
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

WithWeatherTool.test("should render weather component", async ({ canvas }) => {
    const weatherComponent = await waitFor(() =>
        canvas.getByTestId("weather-container"),
    );
    expect(weatherComponent).toBeInTheDocument();
});

export const WithGenerateImageTool = meta.story({
    args: {
        parts: MOCK_TOOL_PARTS_GENERATE_IMAGE,
    },
});

WithGenerateImageTool.test("should render image", async ({ canvas }) => {
    const images = await waitFor(() => canvas.getAllByRole("img"));
    expect(images.length).toBeGreaterThan(0);
});

export const WithGenerateFileTool = meta.story({
    args: {
        parts: MOCK_TOOL_PARTS_GENERATE_FILE,
    },
    parameters: {
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

WithGenerateFileTool.test("should render file banner", async ({ canvas }) => {
    const file = await waitFor(() => canvas.getByText(/generated-script\.py/i));
    expect(file).toBeInTheDocument();
});

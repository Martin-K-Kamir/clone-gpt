import { WithQueryProvider } from "#.storybook/lib/decorators/providers";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import preview from "#.storybook/preview";
import type React from "react";
import { expect } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatVisibility } from "@/features/chat/lib/types";
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

import { ChatComposerFooter } from "./chat-composer-footer";

const StoryWrapper = ({
    Story,
    isOwner = true,
    visibility,
}: {
    Story: React.ComponentType;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
}) => {
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
                                    isOwner={isOwner}
                                    visibility={visibility}
                                    chatId={MOCK_CHAT_ID}
                                    messages={[]}
                                    userChatPreferences={null}
                                >
                                    <div
                                        className="bg-zinc-925 relative w-full"
                                        style={{
                                            minHeight: "100px",
                                        }}
                                    >
                                        <Story />
                                    </div>
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
    component: ChatComposerFooter,
    decorators: [
        (Story: React.ComponentType) => (
            <WithQueryProvider>
                <StoryWrapper
                    Story={Story}
                    isOwner={true}
                    visibility={CHAT_VISIBILITY.PRIVATE}
                />
            </WithQueryProvider>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                isOwner={false}
                visibility={CHAT_VISIBILITY.PUBLIC}
            />
        ),
    ],
});

Default.test("should render footer", async ({ canvas }) => {
    const footer = canvas.getByTestId("chat-composer-footer");
    expect(footer).toBeInTheDocument();
});

Default.test("should render public notice", async ({ canvas }) => {
    const publicNotice = canvas.getByTestId("chat-composer-public-notice");
    expect(publicNotice).toBeInTheDocument();
});

export const WithoutPublicNotice = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                isOwner={true}
                visibility={CHAT_VISIBILITY.PRIVATE}
            />
        ),
    ],
});

WithoutPublicNotice.test("should render footer", async ({ canvas }) => {
    const footer = canvas.getByTestId("chat-composer-footer");
    expect(footer).toBeInTheDocument();
});

WithoutPublicNotice.test(
    "should not render public notice",
    async ({ canvas }) => {
        const publicNotice = canvas.queryByTestId(
            "chat-composer-public-notice",
        );
        expect(publicNotice).not.toBeInTheDocument();
    },
);

import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, DBChatVisibility } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import type { DBUserId } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { ChatComposerFooter } from "./chat-composer-footer";

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
    isOwner = true,
    visibility,
}: {
    Story: React.ComponentType;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
}) => {
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
                                        userId={mockUserId}
                                        isNewChat={false}
                                        isOwner={isOwner}
                                        visibility={visibility}
                                        chatId={mockChatId}
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
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: ChatComposerFooter,
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                isOwner={true}
                visibility={CHAT_VISIBILITY.PRIVATE}
            />
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
    await waitFor(() => {
        const footer = canvas.getByTestId("chat-composer-footer");
        expect(footer).toBeInTheDocument();
    });
});

Default.test("should render public notice", async ({ canvas }) => {
    await waitFor(() => {
        const publicNotice = canvas.getByTestId("chat-composer-public-notice");
        expect(publicNotice).toBeInTheDocument();
    });
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
    await waitFor(() => {
        const footer = canvas.getByTestId("chat-composer-footer");
        expect(footer).toBeInTheDocument();
    });
});

WithoutPublicNotice.test(
    "should not render public notice",
    async ({ canvas }) => {
        await waitFor(() => {
            const publicNotice = canvas.queryByTestId(
                "chat-composer-public-notice",
            );
            expect(publicNotice).not.toBeInTheDocument();
        });
    },
);

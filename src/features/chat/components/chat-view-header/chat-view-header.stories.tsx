import { WithQueryProvider } from "#.storybook/lib/decorators/providers";
import { createMockGuestSession } from "#.storybook/lib/mocks/auth";
import { MOCK_CHAT_ID, createMockChat } from "#.storybook/lib/mocks/chats";
import {
    waitForDialog,
    waitForDropdownMenu,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { Suspense } from "react";
import type React from "react";
import { expect, mocked, userEvent, waitFor } from "storybook/test";

import {
    SidebarInset,
    SidebarProvider,
    SidebarWrapper,
} from "@/components/ui/sidebar";

import { SessionSyncProvider } from "@/features/auth/providers";
import { auth } from "@/features/auth/services/auth";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, WithIsOwner } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
import { getUserChatById } from "@/features/chat/services/db";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { ChatViewHeader } from "./chat-view-header";
import { ChatViewHeaderSkeleton } from "./chat-view-header-skeleton";

function createMockChatWithOwner(
    chatId: DBChatId = MOCK_CHAT_ID,
    isOwner = true,
): ReturnType<typeof createMockChat> & WithIsOwner {
    return {
        ...createMockChat({
            id: chatId,
            visibility: CHAT_VISIBILITY.PRIVATE,
        }),
        isOwner,
    };
}

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    return (
        <UserSessionProvider>
            <SessionSyncProvider>
                <ChatOffsetProvider>
                    <UserCacheSyncProvider>
                        <ChatCacheSyncProvider>
                            <SidebarProvider>
                                <SidebarWrapper
                                    style={
                                        {
                                            "--sidebar-width":
                                                "calc(var(--spacing) * 72)",
                                            "--header-height":
                                                "calc(var(--spacing) * 12)",
                                        } as React.CSSProperties
                                    }
                                    className="max-h-svh"
                                >
                                    <SidebarInset>
                                        <Suspense
                                            fallback={
                                                <ChatViewHeaderSkeleton />
                                            }
                                        >
                                            <Story />
                                        </Suspense>
                                    </SidebarInset>
                                </SidebarWrapper>
                            </SidebarProvider>
                        </ChatCacheSyncProvider>
                    </UserCacheSyncProvider>
                </ChatOffsetProvider>
            </SessionSyncProvider>
        </UserSessionProvider>
    );
};

const meta = preview.meta({
    component: ChatViewHeader,
    decorators: [
        (Story: React.ComponentType) => (
            <WithQueryProvider>
                <StoryWrapper Story={Story} />
            </WithQueryProvider>
        ),
    ],
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: `/chat/${MOCK_CHAT_ID}`,
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    args: {
        chatId: undefined,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockClear();
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
    },
});

Default.test("should render header with all elements", async ({ canvas }) => {
    const header = canvas.getByRole("banner");
    expect(header).toBeInTheDocument();

    const sidebarTrigger = canvas.getByTestId("sidebar-trigger-button");
    expect(sidebarTrigger).toBeVisible();

    const logoLink = canvas.getByRole("link", { name: /clonegpt/i });
    expect(logoLink).toBeVisible();
    expect(logoLink).toHaveAttribute("href", "/");
});

export const WithChat = meta.story({
    name: "With Chat",
    args: {
        chatId: MOCK_CHAT_ID,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockResolvedValue(
            createMockChatWithOwner(MOCK_CHAT_ID, true),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
    },
});

WithChat.test("should render header with chat actions", async ({ canvas }) => {
    const header = canvas.getByRole("banner");
    expect(header).toBeInTheDocument();

    const shareButton = canvas.getByRole("button", { name: /share/i });
    const menuButton = canvas.getByRole("button", {
        name: /open chat actions/i,
    });
    expect(shareButton).toBeVisible();
    expect(menuButton).toBeVisible();
});

WithChat.test("should fetch chat data when chatId is provided", async () => {
    await waitFor(() => {
        expect(mocked(getUserChatById)).toHaveBeenCalledWith({
            chatId: MOCK_CHAT_ID,
            userId: expect.any(String),
        });
    });
});

WithChat.test(
    "should open share dialog when share button is clicked",
    async ({ canvas }) => {
        const shareButton = canvas.getByRole("button", { name: /share/i });
        await userEvent.click(shareButton);
        expect(shareButton).toBeVisible();

        const dialog = await waitForDialog();
        expect(dialog).toBeInTheDocument();
    },
);

WithChat.test(
    "should open menu when menu button is clicked",
    async ({ canvas }) => {
        const menuButton = canvas.getByRole("button", {
            name: /open chat actions/i,
        });
        await userEvent.click(menuButton);
        expect(menuButton).toBeVisible();

        const dropdown = await waitForDropdownMenu();
        expect(dropdown).toBeInTheDocument();
    },
);

export const NonOwnerChat = meta.story({
    name: "Non-Owner Chat",
    args: {
        chatId: MOCK_CHAT_ID,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockResolvedValue(
            createMockChatWithOwner(MOCK_CHAT_ID, false),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
    },
});

NonOwnerChat.test(
    "should not show share and menu buttons for non-owner",
    async ({ canvas }) => {
        const header = canvas.getByRole("banner");
        expect(header).toBeInTheDocument();

        const shareButton = canvas.queryByRole("button", { name: /share/i });
        const menuButton = canvas.queryByRole("button", {
            name: /open chat actions/i,
        });
        expect(shareButton).not.toBeInTheDocument();
        expect(menuButton).not.toBeInTheDocument();
    },
);

export const GuestUser = meta.story({
    name: "Guest User",
    args: {
        chatId: undefined,
    },
    beforeEach: () => {
        mocked(auth).mockResolvedValue(createMockGuestSession() as any);
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
    },
});

GuestUser.test(
    "should render header with log in button",
    async ({ canvas }) => {
        const header = canvas.getByRole("banner");
        expect(header).toBeInTheDocument();

        const logInButton = canvas.getByRole("button", { name: /log in/i });
        expect(logInButton).toBeVisible();
    },
);

GuestUser.test(
    "should open sign in dialog when log in button is clicked",
    async ({ canvas }) => {
        const logInButton = canvas.getByRole("button", { name: /log in/i });
        await userEvent.click(logInButton);

        const dialog = await waitForDialog();
        expect(dialog).toBeInTheDocument();
    },
);

GuestUser.test(
    "should not show share and menu buttons for guest user",
    async ({ canvas }) => {
        const shareButton = canvas.queryByRole("button", { name: /share/i });
        const menuButton = canvas.queryByRole("button", {
            name: /open chat actions/i,
        });
        expect(shareButton).not.toBeInTheDocument();
        expect(menuButton).not.toBeInTheDocument();
    },
);

export const GuestUserWithChat = meta.story({
    name: "Guest User With Chat",
    args: {
        chatId: MOCK_CHAT_ID,
    },
    beforeEach: () => {
        mocked(auth).mockResolvedValue(createMockGuestSession() as any);
        mocked(getUserChatById).mockResolvedValue(
            createMockChatWithOwner(MOCK_CHAT_ID, false),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
    },
});

GuestUserWithChat.test(
    "should render log in button even when viewing a chat",
    async ({ canvas }) => {
        const header = canvas.getByRole("banner");
        expect(header).toBeInTheDocument();

        const logInButton = canvas.getByRole("button", { name: /log in/i });
        expect(logInButton).toBeVisible();

        const shareButton = canvas.queryByRole("button", { name: /share/i });
        const menuButton = canvas.queryByRole("button", {
            name: /open chat actions/i,
        });
        expect(shareButton).not.toBeInTheDocument();
        expect(menuButton).not.toBeInTheDocument();
    },
);

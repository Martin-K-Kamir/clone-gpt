import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_OPEN_CHAT_ACTIONS,
    MOCK_CHAT_BUTTON_SHARE,
} from "#.storybook/lib/mocks/chat";
import {
    MOCK_CHAT_ID,
    createMockChatWithOwner,
    createMockPaginatedChats,
} from "#.storybook/lib/mocks/chats";
import {
    MOCK_CONVERSATION_BASIC,
    MOCK_CONVERSATION_COMPLEX,
    MOCK_CONVERSATION_WITH_LONG_MESSAGES,
} from "#.storybook/lib/mocks/conversations";
import {
    MOCK_EMPTY_USER_CHAT_PREFERENCES,
    MOCK_SESSION,
    createMockUser,
} from "#.storybook/lib/mocks/users";
import {
    waitForButtonByRole,
    waitForDialog,
    waitForDropdownMenu,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { Suspense } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import {
    SidebarInset,
    SidebarProvider,
    SidebarWrapper,
} from "@/components/ui/sidebar";

import { auth } from "@/features/auth/services/auth";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";
import {
    ChatSidebar,
    ChatSidebarSkeleton,
} from "@/features/chat/components/chat-sidebar";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import {
    getUserChatById,
    getUserChatMessages,
    getUserChats,
} from "@/features/chat/services/db";

import { getUserChatPreferences } from "@/features/user/services/db";

import PageLoading from "./loading";
import Page from "./page";

const mockChatId = MOCK_CHAT_ID;
const mockUser = createMockUser();
const mockChat = createMockChatWithOwner(mockChatId);

const PageWrapper = ({ chatId }: { chatId: string }) => {
    return <Page params={Promise.resolve({ chatId })} />;
};

const meta = preview.meta({
    component: PageWrapper,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <SidebarProvider>
                    <ChatSearchDialogClient>
                        <SidebarWrapper className="max-h-svh">
                            <Suspense fallback={<ChatSidebarSkeleton />}>
                                <ChatSidebar />
                            </Suspense>
                            <SidebarInset>
                                <Suspense fallback={<PageLoading />}>
                                    <Story />
                                </Suspense>
                            </SidebarInset>
                        </SidebarWrapper>
                    </ChatSearchDialogClient>
                </SidebarProvider>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: `/chat/${mockChatId}`,
            },
        },
        a11y: {
            disable: true,
        },
    },
});

export const Default = meta.story({
    args: {
        chatId: mockChatId,
    },
    beforeEach: () => {
        mocked(getUserChatById).mockResolvedValue(mockChat);
        mocked(getUserChatMessages).mockResolvedValue({
            data: MOCK_CONVERSATION_BASIC,
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocked(getUserChatPreferences).mockResolvedValue(
            MOCK_EMPTY_USER_CHAT_PREFERENCES,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedChats());
    },
    afterEach: () => {
        mocked(getUserChatById).mockClear();
        mocked(getUserChatMessages).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

Default.test("should render chat messages", async ({ canvas }) => {
    await waitFor(() => {
        const messages = canvas.getAllByTestId("chat-message");
        expect(messages.length).toBeGreaterThan(0);

        messages.forEach(message => {
            expect(message).toBeInTheDocument();
        });
    });
});

Default.test(
    "should open share dialog when clicking share button",
    async ({ canvas, userEvent }) => {
        const shareButton = await waitForButtonByRole(
            canvas,
            MOCK_CHAT_BUTTON_SHARE,
        );

        await userEvent.click(shareButton);

        const shareDialog = await waitForDialog();
        expect(shareDialog).toBeInTheDocument();
    },
);

Default.test(
    "should open chat actions dropdown menu when clicking chat actions button",
    async ({ canvas, userEvent }) => {
        const chatActionsButton = await waitForButtonByRole(
            canvas,
            MOCK_CHAT_BUTTON_OPEN_CHAT_ACTIONS,
        );

        await userEvent.click(chatActionsButton);

        const chatActionsDropdownMenu = await waitForDropdownMenu();
        expect(chatActionsDropdownMenu).toBeInTheDocument();
    },
);

export const WithLongConversation = meta.story({
    args: {
        chatId: mockChatId,
    },
    beforeEach: () => {
        mocked(auth).mockResolvedValue({
            ...MOCK_SESSION,
            user: mockUser,
        } as any);
        mocked(getUserChatById).mockResolvedValue(mockChat);
        mocked(getUserChatMessages).mockResolvedValue({
            data: MOCK_CONVERSATION_WITH_LONG_MESSAGES,
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocked(getUserChatPreferences).mockResolvedValue(
            MOCK_EMPTY_USER_CHAT_PREFERENCES,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedChats());
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
        mocked(getUserChatMessages).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

WithLongConversation.test(
    "should render all messages in long conversation",
    async ({ canvas }) => {
        await waitFor(() => {
            const messages = canvas.getAllByTestId("chat-message");
            expect(messages.length).toBeGreaterThan(0);

            messages.forEach(message => {
                expect(message).toBeInTheDocument();
            });
        });
    },
);

export const ComplexConversation = meta.story({
    args: {
        chatId: mockChatId,
    },
    beforeEach: () => {
        mocked(auth).mockResolvedValue({
            ...MOCK_SESSION,
            user: mockUser,
        } as any);
        mocked(getUserChatById).mockResolvedValue(mockChat);
        mocked(getUserChatMessages).mockResolvedValue({
            data: MOCK_CONVERSATION_COMPLEX,
            visibility: CHAT_VISIBILITY.PRIVATE,
            isOwner: true,
        });
        mocked(getUserChatPreferences).mockResolvedValue(
            MOCK_EMPTY_USER_CHAT_PREFERENCES,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedChats());
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatById).mockClear();
        mocked(getUserChatMessages).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

ComplexConversation.test(
    "should render complex conversation with tools and files",
    async ({ canvas }) => {
        await waitFor(() => {
            const messages = canvas.getAllByTestId("chat-message");
            expect(messages.length).toBeGreaterThan(0);

            messages.forEach(message => {
                expect(message).toBeInTheDocument();
            });
        });
    },
);

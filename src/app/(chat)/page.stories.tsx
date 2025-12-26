import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import {
    SidebarInset,
    SidebarProvider,
    SidebarWrapper,
} from "@/components/ui/sidebar";

import { SessionSyncProvider } from "@/features/auth/providers";
import { auth } from "@/features/auth/services/auth";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";
import {
    ChatSidebar,
    ChatSidebarSkeleton,
} from "@/features/chat/components/chat-sidebar";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import { getUserChats } from "@/features/chat/services/db";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type {
    DBUserChatPreferences,
    DBUserId,
} from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";
import { getUserChatPreferences } from "@/features/user/services/db";

import type { PaginatedData } from "@/lib/types";

import PageLoading from "./loading";
import Page from "./page";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUserChatPreferences: DBUserChatPreferences = {
    id: "00000000-0000-0000-0000-000000000010",
    userId: mockUserId,
    nickname: null,
    role: null,
    personality: "FRIENDLY",
    characteristics: null,
    extraInfo: null,
    createdAt: new Date().toISOString(),
};

const mockedGuestSession = {
    user: {
        id: mockUserId,
        name: "Guest",
        email: "guest@example.com",
        role: USER_ROLE.GUEST,
        image: null,
    },
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
};

const DEFAULT_CHATS_LENGTH = 20;

function createMockChat(index: number): DBChat {
    const fixedDate = new Date("2025-12-20");
    fixedDate.setDate(fixedDate.getDate() - index);
    const date = fixedDate.toISOString();

    return {
        id: index as unknown as DBChatId,
        userId: mockUserId,
        title: `Chat ${index}`,
        visibility: CHAT_VISIBILITY.PRIVATE,
        createdAt: date,
        updatedAt: date,
        visibleAt: date,
    } as const;
}

function createMockChats(length = DEFAULT_CHATS_LENGTH): DBChat[] {
    return Array.from({ length }, (_, index) => createMockChat(index));
}

function createMockPaginatedData(
    length = DEFAULT_CHATS_LENGTH,
    hasNextPage = false,
): PaginatedData<DBChat[]> {
    return {
        data: createMockChats(length),
        totalCount: length,
        hasNextPage,
        nextOffset: hasNextPage ? length : undefined,
    };
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
        },
    });
}

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
                                    <SidebarProvider>
                                        <ChatSearchDialogClient>
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
                                                <Suspense
                                                    fallback={
                                                        <ChatSidebarSkeleton />
                                                    }
                                                >
                                                    <ChatSidebar />
                                                </Suspense>
                                                <SidebarInset>
                                                    <Suspense
                                                        fallback={
                                                            <PageLoading />
                                                        }
                                                    >
                                                        <Story />
                                                    </Suspense>
                                                </SidebarInset>
                                            </SidebarWrapper>
                                        </ChatSearchDialogClient>
                                    </SidebarProvider>
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
    component: Page,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: "/",
            },
        },
    },
});

export const Default = meta.story({
    args: {},
    beforeEach: () => {
        mocked(getUserChatPreferences).mockResolvedValue(
            mockUserChatPreferences,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

Default.test("should render chat sidebar items", async ({ canvas }) => {
    await waitFor(() => {
        const sidebarItems = canvas.getAllByTestId("sidebar-menu-item");
        const chatSidebarHistoryItems = canvas.getAllByTestId(
            "chat-sidebar-history-item",
        );

        expect(sidebarItems.length).toBeGreaterThan(0);
        expect(chatSidebarHistoryItems.length).toBeGreaterThan(0);

        sidebarItems.forEach(item => {
            expect(item).toBeVisible();
        });
        chatSidebarHistoryItems.forEach(item => {
            expect(item).toBeVisible();
        });
    });
});

Default.test("should render user sidebar item", async ({ canvas }) => {
    await waitFor(() => {
        const userName = canvas.getByText("John Doe");
        expect(userName).toBeVisible();

        const userEmail = canvas.getByText("john.doe@example.com");
        expect(userEmail).toBeVisible();

        const userMenuButton = canvas.getByRole("button", {
            name: /open user menu/i,
        });
        expect(userMenuButton).toBeVisible();
    });
});

Default.test("should render user greeting", async ({ canvas }) => {
    await waitFor(() => {
        const greeting = canvas.getByText(
            /Good (morning|afternoon|evening), John!/,
        );
        expect(greeting).toBeVisible();
    });
});

Default.test("should render chat composer", async ({ canvas }) => {
    await waitFor(() => {
        const chatComposer = canvas.getByTestId("chat-composer");
        expect(chatComposer).toBeVisible();
    });
});

Default.test(
    "should collapse sidebar when clicking on the toggle sidebar button",
    async ({ canvas, userEvent }) => {
        await waitFor(async () => {
            const toggleSidebarButton = canvas.getByRole("button", {
                name: /toggle sidebar/i,
            });
            await userEvent.click(toggleSidebarButton);

            const sidebar = canvas.queryByTestId("sidebar");
            expect(sidebar).toHaveAttribute("data-state", "collapsed");
        });
    },
);

export const MobileView = meta.story({
    globals: {
        viewport: { value: "ipad", isRotated: false },
    },
    beforeEach: () => {
        mocked(getUserChatPreferences).mockResolvedValue(
            mockUserChatPreferences,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

MobileView.test(
    "should open sidebar when clicking on the toggle sidebar button",
    async ({ canvas, userEvent }) => {
        await waitFor(async () => {
            const toggleSidebarButton = canvas.getByRole("button", {
                name: /toggle sidebar/i,
            });
            await userEvent.click(toggleSidebarButton);

            const sidebar = document.querySelector(
                '[data-testid="sidebar-sheet-content"][data-state="open"]',
            );
            expect(sidebar).toBeInTheDocument();
        });
    },
);

MobileView.test(
    "should render chat sidebar items",
    async ({ canvas, userEvent }) => {
        await waitFor(async () => {
            const toggleSidebarButton = canvas.getByRole("button", {
                name: /toggle sidebar/i,
            });
            await userEvent.click(toggleSidebarButton);

            const sidebarItems = document.querySelectorAll(
                '[data-testid="sidebar-menu-item"]',
            );
            expect(sidebarItems.length).toBeGreaterThan(0);
        });
    },
);

MobileView.test(
    "should render chat sidebar items",
    async ({ canvas, userEvent }) => {
        await waitFor(async () => {
            const toggleSidebarButton = canvas.getByRole("button", {
                name: /toggle sidebar/i,
            });
            await userEvent.click(toggleSidebarButton);

            const sidebarItems = document.querySelectorAll(
                '[data-testid="sidebar-menu-item"]',
            );
            expect(sidebarItems.length).toBeGreaterThan(0);
        });
    },
);

export const GuestUser = meta.story({
    beforeEach: () => {
        mocked(auth).mockResolvedValue(mockedGuestSession as any);
        mocked(getUserChatPreferences).mockResolvedValue(
            mockUserChatPreferences,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

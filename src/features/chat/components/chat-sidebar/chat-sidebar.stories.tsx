import {
    createMockChats,
    createMockPaginatedChats,
} from "#.storybook/lib/mocks/chats";
import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { SidebarProvider, SidebarWrapper } from "@/components/ui/sidebar";

import { SessionSyncProvider } from "@/features/auth/providers";
import { auth } from "@/features/auth/services/auth";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChat } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import { getUserChats as getUserChatsDB } from "@/features/chat/services/db";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import type { PaginatedData } from "@/lib/types";

import { ChatSidebar } from "./chat-sidebar";
import { ChatSidebarSkeleton } from "./chat-sidebar-skeleton";

const DEFAULT_CHATS_LENGTH = 20;

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
    mockData,
}: {
    Story: React.ComponentType;
    mockData: PaginatedData<DBChat[]>;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    useEffect(() => {
        mocked(getUserChatsDB).mockResolvedValue(mockData);
    }, [mockData]);

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
                                                    <Story />
                                                </Suspense>
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

const createDecorator = (mockData: PaginatedData<DBChat[]>) => {
    return (Story: React.ComponentType) => (
        <StoryWrapper Story={Story} mockData={mockData} />
    );
};

const meta = preview.meta({
    component: ChatSidebar,
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: "/chat/123",
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    decorators: [
        createDecorator(
            createMockPaginatedChats({
                length: DEFAULT_CHATS_LENGTH,
                hasNextPage: false,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        ),
    ],
    beforeEach: () => {
        mocked(getUserChatsDB).mockResolvedValue(
            createMockPaginatedChats({
                length: DEFAULT_CHATS_LENGTH,
                hasNextPage: false,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

Default.test("should render sidebar with all sections", async ({ canvas }) => {
    const sidebar = document.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();

    const newChatButton = canvas.getByRole("link", { name: /new chat/i });
    const searchButton = canvas.getByRole("button", { name: /search/i });
    expect(newChatButton).toBeVisible();
    expect(searchButton).toBeVisible();

    const links = canvas.getAllByRole("link");
    expect(links.length).toBeGreaterThan(1);

    const chatTitles = createMockChats({
        length: 5,
        visibility: CHAT_VISIBILITY.PRIVATE,
    }).map(chat => chat.title);
    chatTitles.forEach(title => {
        expect(canvas.getByText(title)).toBeVisible();
    });
});

export const Skeleton = meta.story({
    name: "Skeleton",
    render: () => <ChatSidebarSkeleton />,
    decorators: [
        Story => (
            <SidebarProvider>
                <SidebarWrapper
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                    className="max-h-svh"
                >
                    <Story />
                </SidebarWrapper>
            </SidebarProvider>
        ),
    ],
});

Skeleton.test("should render skeleton version", async ({ canvas }) => {
    const sidebar = document.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toBeInTheDocument();

    const buttons = canvas.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    const links = canvas.queryAllByRole("link");
    expect(links.length).toBe(1);

    const skeletons = canvas.queryAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
});

export const Empty = meta.story({
    name: "Empty",
    decorators: [
        createDecorator(
            createMockPaginatedChats({
                length: 0,
                hasNextPage: false,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        ),
    ],
    beforeEach: () => {
        mocked(getUserChatsDB).mockResolvedValue(
            createMockPaginatedChats({
                length: 0,
                hasNextPage: false,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

Empty.test("should display empty state when no chats", async ({ canvas }) => {
    const emptyText = canvas.getByRole("paragraph");
    expect(emptyText).toBeVisible();
});

const ErrorStoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    useEffect(() => {
        mocked(getUserChatsDB).mockImplementation(async () => {
            throw new globalThis.Error("Failed to fetch user chats");
        });
    }, []);

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
                                                    <Story />
                                                </Suspense>
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

export const Error = meta.story({
    name: "Error",
    decorators: [
        (Story: React.ComponentType) => <ErrorStoryWrapper Story={Story} />,
    ],
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

Error.test("should render error message", async ({ canvas }) => {
    const errorText = canvas.getByRole("paragraph");
    expect(errorText).toBeVisible();
});

Error.test("should not render chat links on error", async ({ canvas }) => {
    const links = canvas.queryAllByRole("link");
    expect(links.length).toBe(1);
    expect(links[0]).toHaveAttribute("href", "/");
});

Error.test(
    "should still render sidebar actions on error",
    async ({ canvas }) => {
        const newChatButton = canvas.getByRole("link", {
            name: /new chat/i,
        });
        const searchButton = canvas.getByRole("button", {
            name: /search/i,
        });
        expect(newChatButton).toBeVisible();
        expect(searchButton).toBeVisible();
    },
);

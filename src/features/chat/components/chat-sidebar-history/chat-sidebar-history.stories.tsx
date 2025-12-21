import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { Suspense, useEffect, useMemo } from "react";
import { expect, fireEvent, mocked, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import { auth } from "@/features/auth/services/auth";

import {
    CHAT_VISIBILITY,
    QUERY_USER_CHATS_LIMIT,
} from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";
import { getUserChats as getUserChatsDB } from "@/features/chat/services/db";

import type { DBUserId } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";
import type { PaginatedData } from "@/lib/types";

import { ChatSidebarHistory } from "./chat-sidebar-history";
import { ChatSidebarHistorySkeleton } from "./chat-sidebar-history-skeleton";

const DEFAULT_CHATS_LENGTH = 20;

function createMockChat(index: number): DBChat {
    const fixedDate = new Date("2025-12-20");
    fixedDate.setDate(fixedDate.getDate() - index);
    const date = fixedDate.toISOString();

    return {
        id: index as unknown as DBChatId,
        userId: "00000000-0000-0000-0000-000000000001" as DBUserId,
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

const mockChats = createMockChats();

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
            <SidebarProvider>
                <ChatOffsetProvider>
                    <ChatCacheSyncProvider>
                        <ChatSidebarProvider>
                            <div className="bg-zinc-950">
                                <div className="w-72 p-4">
                                    <Suspense
                                        fallback={
                                            <ChatSidebarHistorySkeleton />
                                        }
                                    >
                                        <Story />
                                    </Suspense>
                                </div>
                            </div>
                        </ChatSidebarProvider>
                    </ChatCacheSyncProvider>
                </ChatOffsetProvider>
            </SidebarProvider>
        </QueryClientProvider>
    );
};

const createDecorator = (mockData: PaginatedData<DBChat[]>) => {
    return (Story: React.ComponentType) => (
        <StoryWrapper Story={Story} mockData={mockData} />
    );
};

const meta = preview.meta({
    component: ChatSidebarHistory,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    name: "Default",
    decorators: [createDecorator(createMockPaginatedData())],
    beforeEach: () => {
        mocked(getUserChatsDB).mockResolvedValue(createMockPaginatedData());
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

Default.test("should render all chat items", async ({ canvas }) => {
    await waitFor(() => {
        const links = canvas.getAllByRole("link");
        expect(links.length).toBe(DEFAULT_CHATS_LENGTH);
    });

    const chatTitles = mockChats.slice(0, 5).map(chat => chat.title);
    chatTitles.forEach(title => {
        expect(canvas.getByText(title)).toBeVisible();
    });
});

Default.test("should group chats by time periods", async ({ canvas }) => {
    await waitFor(() => {
        const labels = canvas.getAllByText(
            /Today|Yesterday|This Week|This Month|Older/i,
        );
        expect(labels.length).toBeGreaterThan(0);
    });
});

Default.test(
    "should render chat items as navigable links",
    async ({ canvas }) => {
        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            links.forEach(link => {
                expect(link).toHaveAttribute(
                    "href",
                    expect.stringMatching(/^\/chat\//),
                );
            });
        });
    },
);

export const Empty = meta.story({
    name: "Empty",
    decorators: [createDecorator(createMockPaginatedData(0))],
    beforeEach: () => {
        mocked(getUserChatsDB).mockResolvedValue(createMockPaginatedData(0));
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

Empty.test("should display empty state message", async ({ canvas }) => {
    await waitFor(() => {
        const emptyText = canvas.getByRole("paragraph");
        expect(emptyText).toBeVisible();
    });
});

Empty.test("should not render any chat links", async ({ canvas }) => {
    await waitFor(() => {
        const links = canvas.queryAllByRole("link");
        expect(links.length).toBe(0);
    });
});

export const WithPagination = meta.story({
    decorators: [
        createDecorator(createMockPaginatedData(DEFAULT_CHATS_LENGTH, true)),
    ],
    beforeEach: () => {
        mocked(getUserChatsDB).mockResolvedValue(
            createMockPaginatedData(DEFAULT_CHATS_LENGTH, true),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

WithPagination.test(
    "should display loading skeletons when more pages are available",
    async ({ canvas }) => {
        await waitFor(() => {
            const skeleton = canvas.getAllByTestId("skeleton");
            expect(skeleton.length).toBeGreaterThan(0);
        });
    },
);

const ErrorStoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    useEffect(() => {
        mocked(getUserChatsDB).mockImplementation(async () => {
            throw new globalThis.Error("Failed to fetch user chats");
        });
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <ChatOffsetProvider>
                    <ChatCacheSyncProvider>
                        <ChatSidebarProvider>
                            <div className="bg-zinc-950">
                                <div className="w-72 p-4">
                                    <Suspense
                                        fallback={
                                            <ChatSidebarHistorySkeleton />
                                        }
                                    >
                                        <Story />
                                    </Suspense>
                                </div>
                            </div>
                        </ChatSidebarProvider>
                    </ChatCacheSyncProvider>
                </ChatOffsetProvider>
            </SidebarProvider>
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
    },
});

Error.test("should render error message", async ({ canvas }) => {
    await waitFor(() => {
        const errorText = canvas.getByRole("paragraph");
        expect(errorText).toBeVisible();
    });
});

Error.test("should not render chat links on error", async ({ canvas }) => {
    await waitFor(() => {
        const links = canvas.queryAllByRole("link");
        expect(links.length).toBe(0);
    });
});

const FetchingStoryWrapper = () => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <ChatOffsetProvider>
                    <ChatCacheSyncProvider>
                        <ChatSidebarProvider>
                            <div className="bg-zinc-950">
                                <div className="w-72 p-4">
                                    <Suspense
                                        fallback={
                                            <ChatSidebarHistorySkeleton />
                                        }
                                    >
                                        <ChatSidebarHistory />
                                    </Suspense>
                                </div>
                            </div>
                        </ChatSidebarProvider>
                    </ChatCacheSyncProvider>
                </ChatOffsetProvider>
            </SidebarProvider>
        </QueryClientProvider>
    );
};

export const WithoutInitialData = meta.story({
    render: () => <FetchingStoryWrapper />,
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    const response = api.success.chat.get(
                        createMockPaginatedData(),
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(getUserChatsDB).mockImplementation(async () => {
            return undefined as unknown as PaginatedData<
                (DBChat & { isOwner: boolean })[]
            >;
        });
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

WithoutInitialData.test(
    "should fetch and render chat history from API",
    async ({ canvas }) => {
        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(DEFAULT_CHATS_LENGTH);
        });

        const chatTitles = mockChats.slice(0, 5).map(chat => chat.title);
        chatTitles.forEach(title => {
            expect(canvas.getByText(title)).toBeVisible();
        });
    },
);

const InfiniteScrollingStoryWrapper = () => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <ChatOffsetProvider>
                    <ChatCacheSyncProvider>
                        <ChatSidebarProvider>
                            <div className="bg-zinc-950">
                                <div
                                    className="h-182 w-72 p-4"
                                    data-testid="chat-sidebar-history-container"
                                >
                                    <Suspense
                                        fallback={
                                            <ChatSidebarHistorySkeleton />
                                        }
                                    >
                                        <ChatSidebarHistory />
                                    </Suspense>
                                </div>
                            </div>
                        </ChatSidebarProvider>
                    </ChatCacheSyncProvider>
                </ChatOffsetProvider>
            </SidebarProvider>
        </QueryClientProvider>
    );
};

export const InfiniteScrolling = meta.story({
    render: () => <InfiniteScrollingStoryWrapper />,
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", ({ request }) => {
                    const url = new URL(request.url);
                    const offset = parseInt(
                        url.searchParams.get("offset") || "0",
                        10,
                    );
                    const limit = parseInt(
                        url.searchParams.get("limit") || "40",
                        10,
                    );

                    const MAX_PAGES = 5;
                    const totalChats = MAX_PAGES * limit;
                    const currentPage = Math.floor(offset / limit);
                    const hasNextPage = currentPage + 1 < MAX_PAGES;
                    const nextOffset = hasNextPage ? offset + limit : undefined;

                    const pageChats = Array.from({ length: limit }, (_, i) => {
                        const chatIndex = offset + i;
                        return createMockChat(chatIndex);
                    });

                    const response = api.success.chat.get(
                        {
                            data: pageChats,
                            totalCount: totalChats,
                            hasNextPage,
                            nextOffset,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
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
    beforeEach: () => {
        mocked(getUserChatsDB).mockResolvedValue(
            createMockPaginatedData(DEFAULT_CHATS_LENGTH, true),
        );
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatsDB).mockClear();
    },
});

InfiniteScrolling.test(
    "should progressively load additional pages when scrolling",
    async ({ canvas }) => {
        const getExpectedLength = (pageNumber: number) =>
            DEFAULT_CHATS_LENGTH + (pageNumber - 1) * QUERY_USER_CHATS_LIMIT;

        const links = canvas.getAllByRole("link");
        expect(links.length).toBe(getExpectedLength(1));

        links.at(-1)?.scrollIntoView({ behavior: "smooth" });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(2));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(3));
            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(4));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(5));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(6));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });
    },
);

InfiniteScrolling.test(
    "should hide skeletons when there are no more pages",
    async ({ canvas }) => {
        const getExpectedLength = (pageNumber: number) =>
            DEFAULT_CHATS_LENGTH + (pageNumber - 1) * QUERY_USER_CHATS_LIMIT;

        const links = canvas.getAllByRole("link");
        expect(links.length).toBe(getExpectedLength(1));

        links.at(-1)?.scrollIntoView({ behavior: "smooth" });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(2));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(3));
            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(4));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(5));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(getExpectedLength(6));

            links.at(-1)?.scrollIntoView({ behavior: "smooth" });
        });

        await waitFor(() => {
            const skeletons = canvas.queryAllByTestId("skeleton");
            expect(skeletons.length).toBe(0);
        });
    },
);

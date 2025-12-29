import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    createMockChats,
    createMockPaginatedChats,
    generateChatId,
} from "#.storybook/lib/mocks/chats";
import preview from "#.storybook/preview";
import { HttpResponse, http } from "msw";
import { Suspense } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import {
    CHAT_VISIBILITY,
    QUERY_USER_CHATS_LIMIT,
} from "@/features/chat/lib/constants";
import { getUserChats } from "@/features/chat/services/db";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import { ChatSidebarHistory } from "./chat-sidebar-history";
import { ChatSidebarHistorySkeleton } from "./chat-sidebar-history-skeleton";

const DEFAULT_CHATS_LENGTH = 20;

const meta = preview.meta({
    component: ChatSidebarHistory,
    decorators: [
        Story => (
            <AppProviders>
                <SidebarProvider>
                    <div className="bg-zinc-950">
                        <div className="h-280 w-72 p-4">
                            <Suspense fallback={<ChatSidebarHistorySkeleton />}>
                                <Story />
                            </Suspense>
                        </div>
                    </div>
                </SidebarProvider>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    beforeEach: () => {
        mocked(getUserChats).mockResolvedValue(
            createMockPaginatedChats({
                length: DEFAULT_CHATS_LENGTH,
                hasNextPage: false,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );
    },
    afterEach: () => {
        mocked(getUserChats).mockClear();
    },
});

Default.test("should render all chat items", async ({ canvas }) => {
    await waitFor(() => {
        const links = canvas.getAllByRole("link");
        expect(links.length).toBe(DEFAULT_CHATS_LENGTH);
    });

    const mockChats = createMockChats({
        length: 5,
        visibility: CHAT_VISIBILITY.PRIVATE,
    });
    const chatTitles = mockChats.map(chat => chat.title);
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
    beforeEach: () => {
        mocked(getUserChats).mockResolvedValue(
            createMockPaginatedChats({
                length: 0,
                hasNextPage: false,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );
    },
    afterEach: () => {
        mocked(getUserChats).mockClear();
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

                    const mockData = createMockPaginatedChats({
                        length: 20,
                        hasNextPage: true,
                        nextOffset: offset + limit,
                    });

                    const response = api.success.chat.get(mockData, {
                        count: PLURAL.MULTIPLE,
                    });
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(getUserChats).mockResolvedValue(
            createMockPaginatedChats({
                length: 20,
                hasNextPage: true,
                nextOffset: 20,
            }),
        );
    },
    afterEach: () => {
        mocked(getUserChats).mockClear();
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

export const Error = meta.story({
    beforeEach: () => {
        mocked(getUserChats).mockImplementation(async () => {
            throw new globalThis.Error("Failed to fetch user chats");
        });
    },
    afterEach: () => {
        mocked(getUserChats).mockClear();
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

export const WithoutInitialData = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    const response = api.success.chat.get(
                        createMockPaginatedChats({
                            length: DEFAULT_CHATS_LENGTH,
                            hasNextPage: false,
                            visibility: CHAT_VISIBILITY.PRIVATE,
                        }),
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(getUserChats).mockResolvedValue(
            undefined as unknown as Awaited<ReturnType<typeof getUserChats>>,
        );
    },
    afterEach: () => {
        mocked(getUserChats).mockClear();
    },
});

WithoutInitialData.test(
    "should fetch and render chat history from API",
    async ({ canvas }) => {
        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBe(DEFAULT_CHATS_LENGTH);
        });

        const mockChats = createMockChats({
            length: 5,
            visibility: CHAT_VISIBILITY.PRIVATE,
        });
        const chatTitles = mockChats.map(chat => chat.title);
        chatTitles.forEach(title => {
            expect(canvas.getByText(title)).toBeVisible();
        });
    },
);

export const InfiniteScrolling = meta.story({
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

                    const INITIAL_ITEMS = DEFAULT_CHATS_LENGTH;
                    const ADDITIONAL_PAGES = 5;
                    const TOTAL_ITEMS =
                        INITIAL_ITEMS + ADDITIONAL_PAGES * limit;

                    const itemsLoaded = offset + limit;
                    const hasNextPage = itemsLoaded < TOTAL_ITEMS;
                    const nextOffset = hasNextPage ? offset + limit : undefined;

                    const remainingItems = TOTAL_ITEMS - offset;
                    const pageLength = Math.min(limit, remainingItems);

                    const pageChats = createMockChats({
                        length: pageLength,
                        visibility: CHAT_VISIBILITY.PRIVATE,
                    }).map((chat, i) => ({
                        ...chat,
                        id: generateChatId(offset + i),
                    }));

                    const response = api.success.chat.get(
                        {
                            data: pageChats,
                            totalCount: TOTAL_ITEMS,
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
        mocked(getUserChats).mockResolvedValue(
            createMockPaginatedChats({
                length: DEFAULT_CHATS_LENGTH,
                hasNextPage: true,
                nextOffset: DEFAULT_CHATS_LENGTH,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );
    },
    afterEach: () => {
        mocked(getUserChats).mockClear();
    },
});

InfiniteScrolling.test(
    "should progressively load additional pages when scrolling",
    async ({ canvas }) => {
        const links = canvas.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);

        links.at(-1)?.scrollIntoView({ behavior: "smooth" });

        const links2 = await waitFor(() => {
            const links2 = canvas.getAllByRole("link");
            expect(links2.length).toBeGreaterThan(links.length);

            links2.at(-1)?.scrollIntoView({ behavior: "smooth" });
            return links2;
        });

        const links3 = await waitFor(() => {
            const links3 = canvas.getAllByRole("link");
            expect(links3.length).toBeGreaterThan(links2.length);

            links3.at(-1)?.scrollIntoView({ behavior: "smooth" });
            return links3;
        });

        const links4 = await waitFor(() => {
            const links4 = canvas.getAllByRole("link");
            expect(links4.length).toBeGreaterThan(links3.length);

            links4.at(-1)?.scrollIntoView({ behavior: "smooth" });
            return links4;
        });

        const links5 = await waitFor(() => {
            const links5 = canvas.getAllByRole("link");
            expect(links5.length).toBeGreaterThan(links4.length);

            links5.at(-1)?.scrollIntoView({ behavior: "smooth" });
            return links5;
        });

        await waitFor(() => {
            const links6 = canvas.getAllByRole("link");
            expect(links6.length).toBeGreaterThan(links5.length);

            links6.at(-1)?.scrollIntoView({ behavior: "smooth" });
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
        });

        const finalLinks = canvas.getAllByRole("link");
        finalLinks.at(-1)?.scrollIntoView({ behavior: "smooth" });

        await waitFor(
            () => {
                const skeletons = canvas.queryAllByTestId("skeleton");
                expect(skeletons.length).toBe(0);
            },
            { timeout: 5000 },
        );
    },
);

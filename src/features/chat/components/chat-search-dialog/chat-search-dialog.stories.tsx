import { AppProviders } from "#.storybook/lib/decorators/providers";
import { createMockChats } from "#.storybook/lib/mocks/chats";
import {
    createEmptyUserChatsHandler,
    createErrorUserChatsHandler,
    createPaginatedUserChatsSearchHandler,
    createUserChatsHandler,
    createUserChatsSearchHandler,
} from "#.storybook/lib/msw/handlers";
import { clearAllQueries } from "#.storybook/lib/utils/query-client";
import { waitForDialog } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { Suspense } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import { getUserChatsByDate } from "@/features/chat/services/db";

import { ChatSearchDialog } from "./chat-search-dialog";
import { ChatSearchDialogTrigger } from "./chat-search-dialog-client";

const meta = preview.meta({
    component: ChatSearchDialog,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Suspense fallback={<div>Loading...</div>}>
                    <Story />
                    <ChatSearchDialog>
                        <ChatSearchDialogTrigger>
                            Open Search
                        </ChatSearchDialogTrigger>
                    </ChatSearchDialog>
                </Suspense>
            </AppProviders>
        ),
    ],
    parameters: {
        nextjs: {
            navigation: {
                pathname: "/",
            },
        },
    },
});

export const Default = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserChatsHandler({
                    length: 10,
                }),
                createUserChatsSearchHandler({
                    resultsPerQuery: 5,
                    emptyQueries: ["nonexistentxyz123"],
                }),
            ],
        },
    },
    afterEach: () => {
        clearAllQueries();
    },
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should show initial chats when dialog is open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
        });
    },
);

Default.test(
    "should display search results when query is entered",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "react");

        await waitFor(() => {
            const links = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(links.length).toBeGreaterThan(0);
        });
    },
);

Default.test(
    "should display search results with snippets",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "typescript");

        await waitFor(() => {
            const links = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(links.length).toBeGreaterThan(0);

            const snippets = Array.from(
                document.querySelectorAll('[data-slot="search-item"]'),
            );
            expect(snippets.length).toBeGreaterThan(0);
        });
    },
);

Default.test(
    "should show empty state when search returns no results",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "nonexistentxyz123");

        await waitFor(() => {
            const emptyText = document.querySelector(
                '[data-slot="search-empty"]',
            );
            expect(emptyText).toBeInTheDocument();
        });
    },
);

Default.test(
    "should revert to initial chats when query is cleared",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "react");

        await waitFor(() => {
            const links = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(links.length).toBeGreaterThan(0);
        });

        await userEvent.clear(input!);

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
        });
    },
);

Default.test(
    "should navigate to chat when clicking on initial chat",
    async ({ canvas, userEvent }) => {
        getRouter().push.mockClear();

        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const items = await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
            return items;
        });

        await userEvent.click(items[0]);

        await waitFor(() => {
            expect(getRouter().push).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should navigate to chat when clicking on search result",
    async ({ canvas, userEvent }) => {
        getRouter().push.mockClear();

        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "react");

        const items = await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
            return items;
        });

        await userEvent.click(items[0]);

        await waitFor(() => {
            expect(getRouter().push).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should call getUserChatsByDate when dialog opens",
    async ({ canvas, userEvent }) => {
        mocked(getUserChatsByDate).mockResolvedValue(
            createMockChats({
                length: 10,
                visibility: CHAT_VISIBILITY.PRIVATE,
            }),
        );

        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        expect(mocked(getUserChatsByDate)).toHaveBeenCalled();

        const items = document.querySelectorAll('[data-slot="search-item"]');
        expect(items.length).toBeGreaterThan(0);
    },
);

export const WithoutInitialData = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserChatsHandler({
                    length: 5,
                }),
                createUserChatsSearchHandler({
                    resultsPerQuery: 5,
                    emptyQueries: ["nonexistent"],
                }),
            ],
        },
    },
    afterEach: () => {
        clearAllQueries();
        mocked(getUserChatsByDate).mockClear();
    },
});

WithoutInitialData.test(
    "should call API when initial data is not provided from server",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        expect(mocked(getUserChatsByDate)).toHaveBeenCalled();
        expect(mocked(getUserChatsByDate)).toHaveReturnedWith(undefined);

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
        });
    },
);

export const Empty = meta.story({
    parameters: {
        msw: {
            handlers: [createEmptyUserChatsHandler()],
        },
    },
    afterEach: () => {
        clearAllQueries();
    },
});

Empty.test(
    "should show empty state when no initial chats",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBe(0);
        });
    },
);

export const Error = meta.story({
    parameters: {
        msw: {
            handlers: [createErrorUserChatsHandler("Failed to fetch chats")],
        },
    },
    afterEach: () => {
        clearAllQueries();
    },
});

Error.test("should handle error gracefully", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open Search" });
    await userEvent.click(trigger);

    const input = await waitFor(() => {
        return document.querySelector('[data-slot="search-input"]');
    });

    await userEvent.type(input!, "test");

    await waitFor(
        () => {
            const emptyText = document.querySelector(
                '[data-slot="search-error"]',
            );
            expect(emptyText).toBeInTheDocument();
        },
        { timeout: 10000 },
    );
});

export const WithInfiniteScrolling = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserChatsHandler({
                    length: 10,
                }),
                createPaginatedUserChatsSearchHandler({
                    maxPages: 5,
                    resultsPerPage: 25,
                    daysPerPage: 10,
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(getUserChatsByDate).mockResolvedValue(
            createMockChats({
                length: INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT,
            }),
        );
    },
    afterEach: () => {
        clearAllQueries();
        mocked(getUserChatsByDate).mockClear();
    },
});

WithInfiniteScrolling.test(
    "should progressively load more search results when scrolling",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "react");

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
        });

        const getExpectedLength = (pageNumber: number) => {
            const resultsPerPage = 25;
            return pageNumber * resultsPerPage;
        };

        let items = document.querySelectorAll('[data-slot="search-item"]');
        expect(items.length).toBeGreaterThanOrEqual(25);

        const lastItem = items[items.length - 1];
        if (lastItem) {
            lastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        await waitFor(() => {
            items = document.querySelectorAll('[data-slot="search-item"]');
            expect(items.length).toBeGreaterThanOrEqual(50);
        });

        const newLastItem = items[items.length - 1];
        if (newLastItem) {
            newLastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        await waitFor(() => {
            items = document.querySelectorAll('[data-slot="search-item"]');
            expect(items.length).toBeGreaterThanOrEqual(75);
        });
    },
);

WithInfiniteScrolling.test(
    "should show loading skeleton when fetching more search results",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        const input = await waitFor(() => {
            return document.querySelector('[data-slot="search-input"]');
        });

        await userEvent.type(input!, "react");

        await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(items.length).toBeGreaterThan(0);
        });

        const items = document.querySelectorAll('[data-slot="search-item"]');
        const lastItem = items[items.length - 1];

        if (lastItem) {
            lastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        await waitFor(() => {
            const skeletons = document.querySelectorAll(
                '[data-testid="skeleton"]',
            );
            expect(skeletons.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const newItems = document.querySelectorAll(
                '[data-slot="search-item"]',
            );
            expect(newItems.length).toBeGreaterThan(items.length);
        });
    },
);

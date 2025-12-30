import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_OPEN_SEARCH,
    MOCK_CHAT_ERROR_FETCH_CHATS,
    MOCK_CHAT_LOADING_TEXT,
    MOCK_CHAT_SEARCH_QUERY_NONEXISTENT,
    MOCK_CHAT_SEARCH_QUERY_NONEXISTENT_SHORT,
    MOCK_CHAT_SEARCH_QUERY_REACT,
    MOCK_CHAT_SEARCH_QUERY_TEST,
    MOCK_CHAT_SEARCH_QUERY_TYPESCRIPT,
} from "#.storybook/lib/mocks/chat";
import { createMockChats } from "#.storybook/lib/mocks/chats";
import {
    createEmptyUserChatsHandler,
    createErrorUserChatsHandler,
    createPaginatedUserChatsSearchHandler,
    createUserChatsHandler,
    createUserChatsSearchHandler,
} from "#.storybook/lib/msw/handlers";
import {
    getAllSearchItems,
    getAllSkeletons,
} from "#.storybook/lib/utils/elements";
import { clearAllQueries } from "#.storybook/lib/utils/query-client";
import {
    waitForDialog,
    waitForElement,
    waitForSearchItems,
} from "#.storybook/lib/utils/test-helpers";
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
                <Suspense fallback={<div>{MOCK_CHAT_LOADING_TEXT}</div>}>
                    <Story />
                    <ChatSearchDialog>
                        <ChatSearchDialogTrigger>
                            {MOCK_CHAT_BUTTON_OPEN_SEARCH}
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
                    emptyQueries: [MOCK_CHAT_SEARCH_QUERY_NONEXISTENT],
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
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should show initial chats when dialog is open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        await waitForSearchItems();
    },
);

Default.test(
    "should display search results when query is entered",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_REACT);

        await waitForSearchItems();
    },
);

Default.test(
    "should display search results with snippets",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_TYPESCRIPT);

        await waitForSearchItems();
    },
);

Default.test(
    "should show empty state when search returns no results",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_NONEXISTENT);

        const emptyText = await waitForElement('[data-slot="search-empty"]');
        expect(emptyText).toBeInTheDocument();
    },
);

Default.test(
    "should revert to initial chats when query is cleared",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_REACT);

        await waitForSearchItems();

        await userEvent.clear(input);

        await waitForSearchItems();
    },
);

Default.test(
    "should navigate to chat when clicking on initial chat",
    async ({ canvas, userEvent }) => {
        getRouter().push.mockClear();

        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const items = await waitForSearchItems();

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

        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_REACT);

        const items = await waitForSearchItems();

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

        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        await waitForSearchItems();

        await waitFor(() => {
            expect(mocked(getUserChatsByDate)).toHaveBeenCalled();
        });

        const items = await waitForSearchItems();
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
                    emptyQueries: [MOCK_CHAT_SEARCH_QUERY_NONEXISTENT_SHORT],
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
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        expect(mocked(getUserChatsByDate)).toHaveBeenCalled();
        expect(mocked(getUserChatsByDate)).toHaveReturnedWith(undefined);

        await waitForSearchItems();
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
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const items = getAllSearchItems();
            expect(items.length).toBe(0);
        });
    },
);

export const Error = meta.story({
    parameters: {
        msw: {
            handlers: [
                createErrorUserChatsHandler(MOCK_CHAT_ERROR_FETCH_CHATS),
            ],
        },
    },
    afterEach: () => {
        clearAllQueries();
    },
});

Error.test("should handle error gracefully", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
    });
    await userEvent.click(trigger);

    const input = await waitForElement('[data-slot="search-input"]');

    await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_TEST);

    const error = await waitForElement('[data-slot="search-error"]', {
        timeout: 10000,
    });
    expect(error).toBeInTheDocument();
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
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_REACT);

        await waitForSearchItems({ minCount: 25 });

        let items = getAllSearchItems();
        expect(items.length).toBeGreaterThanOrEqual(25);

        const lastItem = items[items.length - 1];
        if (lastItem) {
            lastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        await waitForSearchItems({ minCount: 50 });
        items = getAllSearchItems();

        const newLastItem = items[items.length - 1];
        if (newLastItem) {
            newLastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        await waitForSearchItems({ minCount: 75 });
    },
);

WithInfiniteScrolling.test(
    "should show loading skeleton when fetching more search results",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_OPEN_SEARCH,
        });
        await userEvent.click(trigger);

        const input = await waitForElement('[data-slot="search-input"]');

        await userEvent.type(input, MOCK_CHAT_SEARCH_QUERY_REACT);

        await waitForSearchItems();

        const items = getAllSearchItems();
        const lastItem = items[items.length - 1];

        if (lastItem) {
            lastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }

        await waitFor(() => {
            const skeletons = getAllSkeletons();
            expect(skeletons.length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const newItems = getAllSearchItems();
            expect(newItems.length).toBeGreaterThan(items.length);
        });
    },
);

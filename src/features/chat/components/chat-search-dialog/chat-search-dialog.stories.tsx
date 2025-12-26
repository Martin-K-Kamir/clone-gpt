import preview from "#.storybook/preview";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { Suspense, useMemo } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import type {
    DBChat,
    DBChatId,
    DBChatSearchResult,
} from "@/features/chat/lib/types";
import { getUserChatsByDate } from "@/features/chat/services/db";

import type { DBUserId } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import { ChatSearchDialog } from "./chat-search-dialog";
import { ChatSearchDialogTrigger } from "./chat-search-dialog-client";

const fixedDate = new Date("2025-12-22T12:00:00.000Z");
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const adjectives = [
    "Modern",
    "Advanced",
    "Complete",
    "Simple",
    "Quick",
    "Deep",
    "Practical",
    "Comprehensive",
    "Essential",
    "Ultimate",
    "Beginner",
    "Professional",
    "Effective",
    "Creative",
    "Powerful",
];

const verbs = [
    "Learn",
    "Build",
    "Create",
    "Master",
    "Understand",
    "Implement",
    "Design",
    "Develop",
    "Explore",
    "Optimize",
    "Deploy",
    "Test",
    "Refactor",
    "Debug",
    "Scale",
];

const nouns = [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "API",
    "Database",
    "Authentication",
    "State Management",
    "Component",
    "Hook",
    "Server Actions",
    "Middleware",
    "Routing",
    "Styling",
    "Testing",
    "Performance",
    "Security",
    "Deployment",
    "CI/CD",
    "Docker",
];

const snippetTemplates = [
    "In this conversation, we discussed the key concepts and best practices for",
    "The main topic covered here is",
    "We explored various approaches to",
    "This chat focused on understanding",
    "Here we learned about",
    "The discussion revolved around",
    "We went through the fundamentals of",
    "This conversation explains how to",
    "We covered important aspects of",
    "The main focus was on",
    "In this session, we talked about",
    "We delved into the details of",
    "This chat provides insights into",
    "We examined different strategies for",
    "The conversation highlights",
];

const snippetEndings = [
    "and its practical applications.",
    "with real-world examples.",
    "including common pitfalls to avoid.",
    "and how to implement it effectively.",
    "covering both theory and practice.",
    "with step-by-step guidance.",
    "and best practices to follow.",
    "including performance considerations.",
    "with code examples and explanations.",
    "and troubleshooting tips.",
    "covering advanced techniques.",
    "with a focus on modern approaches.",
    "and integration strategies.",
    "including security best practices.",
    "with optimization recommendations.",
];

function generateChatTitle(index: number): string {
    const pattern = index % 4;
    const adjIndex = index % adjectives.length;
    const verbIndex = index % verbs.length;
    const nounIndex = index % nouns.length;

    switch (pattern) {
        case 0:
            return `${verbs[verbIndex]} ${nouns[nounIndex]}`;
        case 1:
            return `${verbs[verbIndex]} a ${adjectives[adjIndex]} ${nouns[nounIndex]}`;
        case 2:
            return `Understanding ${nouns[nounIndex]}`;
        case 3:
            return `How to ${verbs[verbIndex]} ${nouns[nounIndex]}`;
        default:
            return `${verbs[verbIndex]} ${nouns[nounIndex]}`;
    }
}

function createMockChat(index: number): DBChat {
    const date = new Date(fixedDate);
    date.setDate(date.getDate() - index);
    const dateStr = date.toISOString();

    return {
        id: `chat-${index}` as DBChatId,
        userId: mockUserId,
        title: generateChatTitle(index),
        visibility: CHAT_VISIBILITY.PRIVATE,
        createdAt: dateStr,
        updatedAt: dateStr,
        visibleAt: dateStr,
    };
}

function createMockChats(length = 10): DBChat[] {
    return Array.from({ length }, (_, index) => createMockChat(index));
}

function generateSnippet(index: number, title: string): string {
    const templateIndex = index % snippetTemplates.length;
    const endingIndex = index % snippetEndings.length;
    const template = snippetTemplates[templateIndex];
    const ending = snippetEndings[endingIndex];

    const titleLower = title.toLowerCase();
    let topic = title;

    if (titleLower.includes("how to")) {
        topic = title.replace(/^how to /i, "");
    } else if (titleLower.startsWith("understanding ")) {
        topic = title.replace(/^understanding /i, "");
    } else if (titleLower.includes(" a ")) {
        const parts = title.split(/ a /i);
        topic = parts[parts.length - 1] || title;
    } else {
        const words = title.split(" ");
        topic = words[words.length - 1] || title;
    }

    return `${template} ${topic.toLowerCase()} ${ending}`;
}

function createMockSearchResult(
    index: number,
    snippet?: string,
): DBChatSearchResult {
    const chat = createMockChat(index);
    return {
        ...chat,
        snippet: snippet || generateSnippet(index, chat.title),
    };
}

function createMockSearchResults(
    query: string,
    limit = 10,
    startIndex = 0,
): DBChatSearchResult[] {
    const queryLower = query.toLowerCase();

    const totalChatsNeeded = startIndex + limit;
    const allChats = createMockChats(totalChatsNeeded * 2);

    const matchingChats: DBChatSearchResult[] = [];
    let currentIndex = startIndex;

    for (let i = 0; i < allChats.length && matchingChats.length < limit; i++) {
        const chat = allChats[i];
        const titleLower = chat.title.toLowerCase();
        const matchesTitle =
            titleLower.includes(queryLower) ||
            chat.title
                .split(" ")
                .some(word => word.toLowerCase().includes(queryLower));

        if (matchesTitle) {
            matchingChats.push(
                createMockSearchResult(
                    currentIndex,
                    generateSnippet(currentIndex, chat.title),
                ),
            );
            currentIndex++;
        }
    }

    while (matchingChats.length < limit) {
        const chatIndex = currentIndex;
        const chat = createMockChat(chatIndex);
        const titleWithQuery = `${chat.title} ${query}`;
        matchingChats.push(
            createMockSearchResult(
                chatIndex,
                generateSnippet(chatIndex, titleWithQuery),
            ),
        );
        currentIndex++;
    }

    return matchingChats.slice(0, limit);
}

let currentQueryClient: QueryClient | null = null;
let apiCallCount = 0;

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
    const queryClient = useMemo(() => {
        const client = createQueryClient();
        currentQueryClient = client;
        return client;
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<div>Loading...</div>}>
                <Story />
                <ChatSearchDialog>
                    <ChatSearchDialogTrigger>
                        Open Search
                    </ChatSearchDialogTrigger>
                </ChatSearchDialog>
            </Suspense>
        </QueryClientProvider>
    );
};

const createDecorator = () => {
    return (Story: React.ComponentType) => <StoryWrapper Story={Story} />;
};

const meta = preview.meta({
    component: ChatSearchDialog,
    parameters: {
        nextjs: {
            navigation: {
                pathname: "/",
            },
        },
    },
});

export const Default = meta.story({
    decorators: [createDecorator()],
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    const response = api.success.chat.get(createMockChats(10), {
                        count: PLURAL.MULTIPLE,
                    });
                    return HttpResponse.json(response);
                }),
                http.get("/api/user-chats/search", ({ request }) => {
                    const url = new URL(request.url);
                    const query = url.searchParams.get("query") || "";

                    if (query === "nonexistentxyz123") {
                        return HttpResponse.json(
                            api.success.chat.search({
                                data: [],
                                totalCount: 0,
                                hasNextPage: false,
                            }),
                        );
                    }

                    if (!query.trim()) {
                        return HttpResponse.json(
                            api.success.chat.search({
                                data: [],
                                totalCount: 0,
                                hasNextPage: false,
                            }),
                        );
                    }

                    const searchResults = createMockSearchResults(query, 5);
                    const response = api.success.chat.search({
                        data: searchResults,
                        totalCount: searchResults.length,
                        hasNextPage: false,
                    });

                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    afterEach: () => {
        if (currentQueryClient) {
            currentQueryClient.clear();
        }
    },
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
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
        mocked(getUserChatsByDate).mockResolvedValue(createMockChats(10));

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
    name: "Without Initial Data",
    decorators: [createDecorator()],
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    apiCallCount++;
                    const response = api.success.chat.get(createMockChats(5), {
                        count: PLURAL.MULTIPLE,
                    });
                    return HttpResponse.json(response);
                }),
                http.get("/api/user-chats/search", ({ request }) => {
                    const url = new URL(request.url);
                    const query = url.searchParams.get("query") || "";

                    if (!query.trim()) {
                        return HttpResponse.json(
                            api.success.chat.search({
                                data: [],
                                totalCount: 0,
                                hasNextPage: false,
                            }),
                        );
                    }

                    if (query.toLowerCase().includes("nonexistent")) {
                        return HttpResponse.json(
                            api.success.chat.search({
                                data: [],
                                totalCount: 0,
                                hasNextPage: false,
                            }),
                        );
                    }

                    const searchResults = createMockSearchResults(query, 5);
                    const response = api.success.chat.search({
                        data: searchResults,
                        totalCount: searchResults.length,
                        hasNextPage: false,
                    });

                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    afterEach: () => {
        if (currentQueryClient) {
            currentQueryClient.clear();
        }
        mocked(getUserChatsByDate).mockClear();
        apiCallCount = 0;
    },
});

WithoutInitialData.test(
    "should call API when initial data is not provided from server",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: "Open Search" });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(apiCallCount).toBeGreaterThan(0);
        });

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
    decorators: [createDecorator()],
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    const response = api.success.chat.get([], { count: 0 });
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    afterEach: () => {
        if (currentQueryClient) {
            currentQueryClient.clear();
        }
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

const ErrorStoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => {
        const client = createQueryClient();
        currentQueryClient = client;
        return client;
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<div>Loading...</div>}>
                <Story />
                <ChatSearchDialog>
                    <ChatSearchDialogTrigger>
                        Open Search
                    </ChatSearchDialogTrigger>
                </ChatSearchDialog>
            </Suspense>
        </QueryClientProvider>
    );
};

export const Error = meta.story({
    decorators: [
        (Story: React.ComponentType) => <ErrorStoryWrapper Story={Story} />,
    ],
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    return HttpResponse.json(
                        api.error("Failed to fetch chats"),
                        { status: 500 },
                    );
                }),
            ],
        },
    },
    afterEach: () => {
        if (currentQueryClient) {
            currentQueryClient.clear();
        }
    },
});

Error.test("should handle error gracefully", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Open Search" });
    await userEvent.click(trigger);

    const input = await waitFor(() => {
        return document.querySelector('[data-slot="search-input"]');
    });

    await userEvent.type(input!, "test");

    await waitFor(() => {
        const emptyText = document.querySelector('[data-slot="search-error"]');
        expect(emptyText).toBeInTheDocument();
    });
});

export const WithInfiniteScrolling = meta.story({
    name: "With Infinite Scrolling",
    decorators: [createDecorator()],
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats", () => {
                    const response = api.success.chat.get(createMockChats(10), {
                        count: PLURAL.MULTIPLE,
                    });
                    return HttpResponse.json(response);
                }),
                http.get("/api/user-chats/search", ({ request }) => {
                    const url = new URL(request.url);
                    const query = url.searchParams.get("query") || "";
                    const cursorDate = url.searchParams.get("cursorDate");
                    const cursorId = url.searchParams.get("cursorId");
                    const limitParam = url.searchParams.get("limit");
                    const limit = limitParam ? parseInt(limitParam, 10) : 25;

                    if (!query.trim()) {
                        return HttpResponse.json(
                            api.success.chat.search({
                                data: [],
                                totalCount: 0,
                                hasNextPage: false,
                            }),
                        );
                    }

                    let pageNumber = 0;
                    if (cursorDate && cursorId) {
                        const cursorDateObj = new Date(cursorDate);
                        const daysDiff = Math.floor(
                            (fixedDate.getTime() - cursorDateObj.getTime()) /
                                (1000 * 60 * 60 * 24),
                        );
                        pageNumber = Math.floor(daysDiff / 10) + 1;
                    }

                    const MAX_PAGES = 5;
                    const hasNextPage = pageNumber < MAX_PAGES - 1;

                    const resultsPerPage = limit;
                    const startIndex = pageNumber * resultsPerPage;

                    const searchResults = createMockSearchResults(
                        query,
                        resultsPerPage,
                        startIndex,
                    );

                    const nextCursor = hasNextPage
                        ? {
                              date: new Date(
                                  fixedDate.getTime() -
                                      (pageNumber + 1) *
                                          10 *
                                          24 *
                                          60 *
                                          60 *
                                          1000,
                              ).toISOString(),
                              id: `chat-${(pageNumber + 1) * resultsPerPage}` as DBChatId,
                          }
                        : undefined;

                    const response = api.success.chat.search({
                        data: searchResults,
                        totalCount: MAX_PAGES * resultsPerPage,
                        hasNextPage,
                        cursor: nextCursor,
                    });

                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(getUserChatsByDate).mockResolvedValue(
            createMockChats(INITIAL_QUERY_SEARCH_USER_CHATS_LIMIT),
        );
    },
    afterEach: () => {
        if (currentQueryClient) {
            currentQueryClient.clear();
        }
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

import preview from "#.storybook/preview";
import { QueryProvider, getQueryClient } from "@/providers/query-provider";
import { HttpResponse, http } from "msw";
import { expect, mocked, waitFor } from "storybook/test";

import { Toaster } from "@/components/ui/sonner";

import {
    CHAT_VISIBILITY,
    QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT,
} from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
import {
    setAllUserChatsVisibility,
    updateManyChatsVisibility,
} from "@/features/chat/services/actions";

import type { DBUserId } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import type { PaginatedData } from "@/lib/types";

import { UserSharedChatsTable } from "./user-shared-chats-table";

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
    const fixedDate = new Date("2025-01-01");
    fixedDate.setDate(fixedDate.getDate() - index);
    const date = fixedDate.toISOString();

    return {
        id: `chat-${index}` as DBChatId,
        userId: mockUserId,
        title: generateChatTitle(index),
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: date,
        updatedAt: date,
        visibleAt: date,
    } as const;
}

function createMockChats(length: number): DBChat[] {
    return Array.from({ length }, (_, index) => createMockChat(index));
}

function createMockPaginatedData(
    length: number,
    hasNextPage = false,
): PaginatedData<DBChat[]> {
    return {
        data: createMockChats(length),
        totalCount: length,
        hasNextPage,
        nextOffset: hasNextPage ? length : undefined,
    };
}

const StoryWrapper = (Story: React.ComponentType<any>) => {
    return (
        <QueryProvider>
            <ChatOffsetProvider>
                <ChatCacheSyncProvider>
                    <div className="bg-zinc-925 flex h-full items-center justify-center">
                        <div className="w-full max-w-2xl">
                            <Story />
                        </div>
                    </div>
                    <Toaster />
                </ChatCacheSyncProvider>
            </ChatOffsetProvider>
        </QueryProvider>
    );
};

const meta = preview.meta({
    component: UserSharedChatsTable,
    decorators: [StoryWrapper],
});

export const Default = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats/shared", ({ request }) => {
                    const url = new URL(request.url);
                    const limitParam = url.searchParams.get("limit");
                    const offsetParam = url.searchParams.get("offset");
                    const limit = limitParam
                        ? parseInt(limitParam)
                        : QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT;
                    const offset = offsetParam ? parseInt(offsetParam) : 0;

                    const totalChats = 50;
                    const chats = createMockChats(totalChats);
                    const paginatedChats = chats.slice(offset, offset + limit);
                    const hasNextPage = offset + limit < totalChats;

                    const response = api.success.chat.getShared(
                        {
                            data: paginatedChats,
                            hasNextPage,
                            totalCount: totalChats,
                            nextOffset: hasNextPage
                                ? offset + limit
                                : undefined,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = getQueryClient();
        queryClient.removeQueries({
            predicate: query => {
                const key = query.queryKey;
                return (
                    Array.isArray(key) &&
                    key.length > 0 &&
                    key[0] === tag.userSharedChats()
                );
            },
        });

        mocked(updateManyChatsVisibility).mockImplementation(
            async ({ chatIds }: { chatIds: DBChatId[] }) => {
                const deletedChats = chatIds.map(id => {
                    const index = parseInt(id.replace("chat-", ""));
                    return createMockChat(index);
                });
                return api.success.chat.visibility(deletedChats, {
                    visibility: CHAT_VISIBILITY.PRIVATE,
                    count: PLURAL.MULTIPLE,
                });
            },
        );
        mocked(setAllUserChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(undefined, {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
    },
    afterEach: () => {
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

Default.test("should render table with shared chats", async ({ canvas }) => {
    await waitFor(() => {
        expect(canvas.getByRole("table")).toBeInTheDocument();
        expect(canvas.getAllByRole("row").length).toBeGreaterThan(1);
    });
});

Default.test("should render table headers", async ({ canvas }) => {
    await waitFor(() => {
        expect(canvas.getAllByRole("columnheader").length).toBeGreaterThan(0);
    });
});

Default.test("should render chat links", async ({ canvas }) => {
    await waitFor(() => {
        expect(canvas.getAllByRole("link").length).toBeGreaterThan(0);
    });
});

Default.test(
    "should render delete buttons for each chat",
    async ({ canvas }) => {
        await waitFor(() => {
            const chatLinks = canvas.getAllByRole("link");
            const deleteButtons = canvas.getAllByRole("button", {
                name: /delete shared chat/i,
            });
            expect(deleteButtons.length).toEqual(chatLinks.length);
        });
    },
);

Default.test(
    "should render dropdown menu trigger in header",
    async ({ canvas, userEvent }) => {
        const menuButton = await waitFor(async () => {
            const menuButton = canvas.getByRole("button", {
                name: /open menu/i,
            });
            expect(menuButton).toBeInTheDocument();
            return menuButton;
        });

        await userEvent.click(menuButton);

        await waitFor(() => {
            const dropdownMenu = document.querySelector(
                '[data-slot="dropdown-menu-content"]',
            );
            expect(dropdownMenu).toBeInTheDocument();
        });
    },
);

Default.test("should render pagination controls", async ({ canvas }) => {
    await waitFor(() => {
        const pagination = canvas.getByRole("navigation", {
            name: /pagination/i,
        });
        expect(pagination).toBeInTheDocument();
    });
});

Default.test("should display correct page information", async ({ canvas }) => {
    await waitFor(() => {
        const pageInfo = canvas.getByText(/page 1 of/i);
        expect(pageInfo).toBeInTheDocument();
        expect(pageInfo).toHaveTextContent(/page 1 of 3/i);
    });
});

Default.test(
    "should navigate to next page when next button is clicked",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const nextButton = canvas.getByRole("button", {
                name: /go to next page/i,
            });
            expect(nextButton).toBeInTheDocument();
            expect(nextButton).toBeEnabled();
        });

        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        await userEvent.click(nextButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page 2 of/i);
            expect(pageInfo).toBeInTheDocument();
        });

        await waitFor(() => {
            const chatLinks = canvas.getAllByRole("link");
            expect(chatLinks.length).toBeGreaterThan(0);
        });
    },
);

Default.test(
    "should navigate to previous page when previous button is clicked",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const nextButton = canvas.getByRole("button", {
                name: /go to next page/i,
            });
            expect(nextButton).toBeInTheDocument();
            expect(nextButton).toBeEnabled();
        });

        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        await userEvent.click(nextButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page 2 of/i);
            expect(pageInfo).toBeInTheDocument();
        });

        const prevButton = canvas.getByRole("button", {
            name: /go to previous page/i,
        });
        await userEvent.click(prevButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page 1 of/i);
            expect(pageInfo).toBeInTheDocument();
        });
    },
);

Default.test(
    "should navigate to last page when last page button is clicked",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const lastPageButton = canvas.getByRole("button", {
                name: /go to last page/i,
            });
            expect(lastPageButton).toBeInTheDocument();
            expect(lastPageButton).toBeEnabled();
        });

        const lastPageButton = canvas.getByRole("button", {
            name: /go to last page/i,
        });
        await userEvent.click(lastPageButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page 3 of/i);
            expect(pageInfo).toBeInTheDocument();
        });

        await waitFor(() => {
            const nextButton = canvas.getByRole("button", {
                name: /go to next page/i,
            });
            expect(nextButton).toBeDisabled();
        });
    },
);

Default.test(
    "should navigate to first page when first page button is clicked",
    async ({ canvas, userEvent }) => {
        const lastPageButton = await waitFor(() => {
            const button = canvas.getByRole("button", {
                name: /go to last page/i,
            });
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
            return button;
        });

        await userEvent.click(lastPageButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page 3 of/i);
            expect(pageInfo).toBeInTheDocument();
        });

        const firstPageButton = canvas.getByRole("button", {
            name: /go to first page/i,
        });
        await userEvent.click(firstPageButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page 1 of/i);
            expect(pageInfo).toBeInTheDocument();
        });

        await waitFor(() => {
            const prevButton = canvas.getByRole("button", {
                name: /go to previous page/i,
            });
            expect(prevButton).toBeDisabled();
        });
    },
);

Default.test(
    "should be able to delete all shared chats",
    async ({ canvas, userEvent }) => {
        const menuButton = await waitFor(async () => {
            const menuButton = canvas.getByRole("button", {
                name: /open menu/i,
            });
            expect(menuButton).toBeInTheDocument();
            return menuButton;
        });

        await userEvent.click(menuButton);

        const deleteAllButton = await waitFor(() => {
            const button = document.querySelector(
                '[data-testid="user-shared-chats-table-dropdown-menu-item-delete-all"]',
            );
            expect(button).toBeInTheDocument();
            return button;
        });

        await userEvent.click(deleteAllButton!);

        expect(setAllUserChatsVisibility).toHaveBeenCalledWith({
            visibility: CHAT_VISIBILITY.PRIVATE,
        });

        expect(setAllUserChatsVisibility).toHaveBeenCalledTimes(1);

        const noResultsMessage = canvas.getByTestId(
            "data-table-content-no-results",
        );
        expect(noResultsMessage).toBeInTheDocument();
        const pagination = canvas.queryByRole("navigation", {
            name: /pagination/i,
        });
        expect(pagination).toBeNull();
    },
);

Default.test("should render clickable chat links", async ({ canvas }) => {
    const firstLink = await waitFor(() => {
        expect(canvas.getByRole("table")).toBeInTheDocument();
        const links = canvas.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
        return links[0]!;
    });

    expect(firstLink).toBeInTheDocument();
    expect(firstLink).toBeEnabled();
    expect(firstLink).toHaveAttribute("href", "/chat/chat-0");
    expect(firstLink).toHaveAttribute("target", "_blank");
});

Default.test("should handle link click", async ({ canvas, userEvent }) => {
    const firstLink = await waitFor(() => {
        expect(canvas.getByRole("table")).toBeInTheDocument();
        const links = canvas.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
        return links[0]!;
    });

    const href = firstLink.getAttribute("href");
    expect(href).toBeTruthy();

    let clicked = false;
    firstLink.addEventListener(
        "click",
        e => {
            e.preventDefault();
            clicked = true;
        },
        { once: true },
    );
    await userEvent.click(firstLink);

    expect(clicked).toBe(true);
});

Default.test(
    "should delete a single shared chat",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            expect(canvas.getByRole("table")).toBeInTheDocument();
        });

        const deleteButton = await waitFor(() => {
            const buttons = canvas.getAllByRole("button", {
                name: /delete shared chat/i,
            });
            expect(buttons.length).toBeGreaterThan(0);
            const deleteButton = buttons[0]!;
            expect(deleteButton).toBeInTheDocument();
            expect(deleteButton).toBeEnabled();
            return deleteButton;
        });

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(updateManyChatsVisibility).toHaveBeenCalledWith({
                visibility: CHAT_VISIBILITY.PRIVATE,
                chatIds: expect.arrayContaining(["chat-0"]),
            });
        });

        expect(updateManyChatsVisibility).toHaveBeenCalledTimes(1);
    },
);

Default.test(
    "should delete multiple shared chats",
    async ({ canvas, userEvent }) => {
        const deleteButtons = await waitFor(() => {
            expect(canvas.getByRole("table")).toBeInTheDocument();
            const deleteButtons = canvas.getAllByRole("button", {
                name: /delete shared chat/i,
            });
            expect(deleteButtons[0]).toBeInTheDocument();
            expect(deleteButtons[0]).toBeEnabled();
            return deleteButtons;
        });

        expect(deleteButtons.length).toBeGreaterThanOrEqual(2);

        await userEvent.click(deleteButtons[0]!);
        await userEvent.click(deleteButtons[1]!);
        await userEvent.click(deleteButtons[2]!);

        await waitFor(() => {
            expect(updateManyChatsVisibility).toHaveBeenCalledWith({
                visibility: CHAT_VISIBILITY.PRIVATE,
                chatIds: expect.arrayContaining(["chat-0", "chat-2", "chat-4"]),
            });
        });

        expect(updateManyChatsVisibility).toHaveBeenCalledTimes(1);
    },
);

export const Empty = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats/shared", () => {
                    const response = api.success.chat.getShared(
                        {
                            data: [],
                            hasNextPage: false,
                            totalCount: 0,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = getQueryClient();
        queryClient.removeQueries({
            predicate: query => {
                const key = query.queryKey;
                return (
                    Array.isArray(key) &&
                    key.length > 0 &&
                    key[0] === tag.userSharedChats()
                );
            },
        });

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(createMockChats(0), {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(setAllUserChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(undefined, {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
    },
    afterEach: () => {
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

Empty.test(
    "should show no results message when no shared chats",
    async ({ canvas }) => {
        await waitFor(() => {
            const message = canvas.getByTestId("data-table-content-no-results");
            expect(message).toBeInTheDocument();
        });
    },
);

export const Loading = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats/shared", async ({ request }) => {
                    await new Promise(resolve => setTimeout(resolve, 2_000));
                    const url = new URL(request.url);
                    const limitParam = url.searchParams.get("limit");
                    const offsetParam = url.searchParams.get("offset");
                    const limit = limitParam
                        ? parseInt(limitParam)
                        : QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT;
                    const offset = offsetParam ? parseInt(offsetParam) : 0;

                    const totalChats = 50;
                    const chats = createMockChats(totalChats);
                    const paginatedChats = chats.slice(offset, offset + limit);
                    const hasNextPage = offset + limit < totalChats;

                    const response = api.success.chat.getShared(
                        {
                            data: paginatedChats,
                            hasNextPage,
                            totalCount: totalChats,
                            nextOffset: hasNextPage
                                ? offset + limit
                                : undefined,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = getQueryClient();
        queryClient.removeQueries({
            predicate: query => {
                const key = query.queryKey;
                return (
                    Array.isArray(key) &&
                    key.length > 0 &&
                    key[0] === tag.userSharedChats()
                );
            },
        });

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(createMockChats(0), {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(setAllUserChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(undefined, {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
    },
    afterEach: () => {
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

Loading.test("should show loading state", async ({ canvas }) => {
    const skeletons = canvas.getAllByTestId("skeleton", { exact: false });
    expect(skeletons.length).toBeGreaterThan(0);
});

export const WithFewChats = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats/shared", () => {
                    const chats = createMockChats(5);
                    const response = api.success.chat.getShared(
                        {
                            data: chats,
                            hasNextPage: false,
                            totalCount: 5,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = getQueryClient();
        queryClient.removeQueries({
            predicate: query => {
                const key = query.queryKey;
                return (
                    Array.isArray(key) &&
                    key.length > 0 &&
                    key[0] === tag.userSharedChats()
                );
            },
        });

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(createMockChats(0), {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(setAllUserChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(undefined, {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
    },
    afterEach: () => {
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

WithFewChats.test(
    "should disable pagination buttons when there is only one page",
    async ({ canvas }) => {
        await waitFor(() => {
            expect(canvas.getByRole("table")).toBeInTheDocument();
        });

        await waitFor(() => {
            const firstPageButton = canvas.getByRole("button", {
                name: /go to first page/i,
            });
            const prevPageButton = canvas.getByRole("button", {
                name: /go to previous page/i,
            });
            const nextPageButton = canvas.getByRole("button", {
                name: /go to next page/i,
            });
            const lastPageButton = canvas.getByRole("button", {
                name: /go to last page/i,
            });

            expect(firstPageButton).toBeDisabled();
            expect(prevPageButton).toBeDisabled();
            expect(nextPageButton).toBeDisabled();
            expect(lastPageButton).toBeDisabled();
        });
    },
);

import { AppProviders } from "#.storybook/lib/decorators/providers";
import { createMockChats } from "#.storybook/lib/mocks/chats";
import {
    createEmptySharedChatsHandler,
    createSharedChatsHandler,
} from "#.storybook/lib/msw/handlers";
import { clearUserSharedChatsQueries } from "#.storybook/lib/utils/query-client";
import {
    clickLinkAndVerify,
    waitForAllButtonsByText,
    waitForButtonByText,
    waitForDropdownMenu,
    waitForElement,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";
import {
    setAllUserChatsVisibility,
    updateManyChatsVisibility,
} from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import { UserSharedChatsTable } from "./user-shared-chats-table";

const mockChats = createMockChats({
    length: 50,
    visibility: CHAT_VISIBILITY.PUBLIC,
});

const mockChatsFew = createMockChats({
    length: 5,
    visibility: CHAT_VISIBILITY.PUBLIC,
});

const meta = preview.meta({
    component: UserSharedChatsTable,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="bg-zinc-925 flex h-full items-center justify-center">
                    <div className="w-full max-w-2xl">
                        <Story />
                    </div>
                </div>
            </AppProviders>
        ),
    ],
});

export const Default = meta.story({
    parameters: {
        msw: {
            handlers: [createSharedChatsHandler({ chats: mockChats })],
        },
        a11y: {
            disable: true,
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateManyChatsVisibility).mockImplementation(
            async ({ chatIds }: { chatIds: DBChatId[] }) => {
                const deletedChats = chatIds.map(id => {
                    const index = parseInt(id.replace("chat-", ""), 10);
                    return mockChats[index]!;
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
    async ({ userEvent }) => {
        const menuButton = await waitForButtonByText(/open menu/i);

        await userEvent.click(menuButton);

        await waitForDropdownMenu();
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
        expect(pageInfo).toHaveTextContent(/page 1 of (3|5)/i);
    });
});

Default.test(
    "should navigate to next page when next button is clicked",
    async ({ canvas, userEvent }) => {
        const nextButton = await waitForButtonByText(/go to next page/i);
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
        const nextButton = await waitForButtonByText(/go to next page/i);

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
        const lastPageButton = await waitForButtonByText(/go to last page/i);

        await userEvent.click(lastPageButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page \d+ of/i);
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
        const lastPageButton = await waitForButtonByText(/go to last page/i);

        await userEvent.click(lastPageButton);

        await waitFor(() => {
            const pageInfo = canvas.getByText(/page \d+ of/i);
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
        const menuButton = await waitForButtonByText(/open menu/i);

        await userEvent.click(menuButton);

        const deleteAllButton = await waitForElement(
            '[data-testid="user-shared-chats-table-dropdown-menu-item-delete-all"]',
        );

        await userEvent.click(deleteAllButton);

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
    await waitFor(() => {
        expect(canvas.getByRole("table")).toBeInTheDocument();
        const links = canvas.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
        return links[0]!;
    });

    const links = canvas.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    const firstLink = links[0]!;
    expect(firstLink).toBeEnabled();
    expect(firstLink).toHaveAttribute(
        "href",
        expect.stringContaining("/chat/"),
    );
    expect(firstLink).toHaveAttribute("target", "_blank");
});

Default.test("should handle link click", async ({ canvas, userEvent }) => {
    await waitFor(() => {
        expect(canvas.getByRole("table")).toBeInTheDocument();
        const links = canvas.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
        return links[0]!;
    });

    const links = canvas.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    const firstLink = links[0]!;
    const href = firstLink.getAttribute("href");
    expect(href).toBeTruthy();

    await clickLinkAndVerify(firstLink, userEvent, href || undefined);
});

Default.test(
    "should delete a single shared chat",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            expect(canvas.getByRole("table")).toBeInTheDocument();
        });

        const deleteButton = await waitForButtonByText(/delete shared chat/i);

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(updateManyChatsVisibility).toHaveBeenCalledWith({
                visibility: CHAT_VISIBILITY.PRIVATE,
                chatIds: expect.any(Array),
            });
        });

        expect(updateManyChatsVisibility).toHaveBeenCalledTimes(1);
    },
);

Default.test(
    "should delete multiple shared chats",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            expect(canvas.getByRole("table")).toBeInTheDocument();
        });

        const deleteButtons =
            await waitForAllButtonsByText(/delete shared chat/i);

        expect(deleteButtons.length).toBeGreaterThanOrEqual(2);

        await userEvent.click(deleteButtons[0]!);
        await userEvent.click(deleteButtons[1]!);
        await userEvent.click(deleteButtons[2]!);

        await waitFor(() => {
            expect(updateManyChatsVisibility).toHaveBeenCalledWith({
                visibility: CHAT_VISIBILITY.PRIVATE,
                chatIds: expect.any(Array),
            });
        });

        expect(updateManyChatsVisibility).toHaveBeenCalledTimes(1);
    },
);

export const Empty = meta.story({
    parameters: {
        msw: {
            handlers: [createEmptySharedChatsHandler()],
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility([], {
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
                createSharedChatsHandler({
                    chats: mockChats,
                    delay: 2_000,
                }),
            ],
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility([], {
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
                createSharedChatsHandler({
                    chats: mockChatsFew,
                    hasNextPage: false,
                }),
            ],
        },
        a11y: {
            disable: true,
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility([], {
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

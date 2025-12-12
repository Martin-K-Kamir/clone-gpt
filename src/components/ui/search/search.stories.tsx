import preview from "#.storybook/preview";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import {
    IconBell,
    IconFile,
    IconFolder,
    IconMessageCircle,
    IconSearch,
    IconSettings,
    IconTrash,
    IconUser,
} from "@tabler/icons-react";
import { sub } from "date-fns";
import React, { useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    Search,
    SearchDialog,
    SearchDialogContent,
    SearchDialogTrigger,
    SearchEmpty,
    SearchError,
    SearchGroup,
    SearchGroupSkeleton,
    SearchInput,
    SearchItem,
    SearchList,
    SearchResultsList,
    SearchSeparator,
} from "./";
import { SearchDialogContext } from "./search-dialog";
import type { SearchResultsItemResult } from "./search-results-item";

const defaultSearchDialogContext = {
    fullscreen: false,
    isFullscreen: false,
    isFullscreenXs: false,
    isFullscreenSm: false,
    isFullscreenMd: false,
    isFullscreenLg: false,
    isFullscreenXl: false,
    isFullscreen2xl: false,
    isFullscreen3xl: false,
};

const meta = preview.meta({
    component: Search,
    tags: ["autodocs"],
    args: {
        onValueChange: fn(),
    },
    decorators: [
        Story => (
            <SearchDialogContext.Provider value={defaultSearchDialogContext}>
                <Story />
            </SearchDialogContext.Provider>
        ),
    ],
    argTypes: {
        value: {
            control: false,
            table: {
                disable: true,
            },
        },
        defaultValue: {
            control: false,
            table: {
                disable: true,
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        onValueChange: {
            control: false,
            table: {
                disable: true,
            },
        },
    },
});

const today = new Date();
const yesterday = sub(today, { days: 1 });
const fixedDate1 = new Date("2024-01-10T12:00:00Z");
const fixedDate2 = new Date("2024-01-05T12:00:00Z");
const fixedDate3 = new Date("2023-12-20T12:00:00Z");

// Mock data for search results
const mockSearchResults: SearchResultsItemResult[] = [
    {
        id: "1",
        title: "Getting Started with React",
        snippet:
            "Learn the basics of React and how to build your first component",
        updatedAt: today.toISOString(),
        createdAt: today.toISOString(),
        href: "/chat/1",
    },
    {
        id: "2",
        title: "Advanced TypeScript Patterns",
        snippet: "Explore advanced TypeScript patterns and best practices",
        updatedAt: yesterday.toISOString(),
        createdAt: yesterday.toISOString(),
        href: "/chat/2",
    },
    {
        id: "3",
        title: "Building with Next.js",
        snippet: "Create modern web applications with Next.js framework",
        updatedAt: fixedDate1.toISOString(),
        createdAt: fixedDate1.toISOString(),
        href: "/chat/3",
    },
].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
});

const groupedSearchResults = {
    Recent: [
        {
            id: "1",
            title: "Getting Started with React",
            snippet:
                "Learn the basics of React and how to build your first component",
            updatedAt: today.toISOString(),
            createdAt: today.toISOString(),
            href: "/chat/1",
        },
        {
            id: "2",
            title: "Advanced TypeScript Patterns",
            snippet: "Explore advanced TypeScript patterns and best practices",
            updatedAt: yesterday.toISOString(),
            createdAt: yesterday.toISOString(),
            href: "/chat/2",
        },
        {
            id: "3",
            title: "Building with Next.js",
            snippet: "Create modern web applications with Next.js framework",
            updatedAt: fixedDate1.toISOString(),
            createdAt: fixedDate2.toISOString(),
            href: "/chat/3",
        },
        {
            id: "7",
            title: "React Server Components Explained",
            snippet:
                "Understanding the new React Server Components architecture and how to use them effectively",
            updatedAt: today.toISOString(),
            createdAt: today.toISOString(),
            href: "/chat/7",
        },
        {
            id: "8",
            title: "Testing React Applications",
            snippet:
                "Best practices for unit testing, integration testing, and E2E testing with React",
            updatedAt: yesterday.toISOString(),
            createdAt: yesterday.toISOString(),
            href: "/chat/8",
        },
    ].sort((a, b) => {
        return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }),
    Popular: [
        {
            id: "4",
            title: "Understanding React Hooks",
            snippet:
                "Deep dive into useState, useEffect, and custom hooks patterns",
            updatedAt: yesterday.toISOString(),
            createdAt: yesterday.toISOString(),
            href: "/chat/4",
        },
        {
            id: "5",
            title: "CSS-in-JS vs Tailwind CSS",
            snippet:
                "Comparing styling approaches for modern React applications",
            updatedAt: fixedDate2.toISOString(),
            createdAt: fixedDate2.toISOString(),
            href: "/chat/5",
        },
        {
            id: "6",
            title: "State Management Best Practices",
            snippet: "Exploring Zustand, Redux, and Context API use cases",
            updatedAt: fixedDate2.toISOString(),
            createdAt: fixedDate2.toISOString(),
            href: "/chat/6",
        },
        {
            id: "9",
            title: "Performance Optimization in React",
            snippet:
                "Techniques for optimizing React applications including memoization, code splitting, and lazy loading",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/9",
        },
        {
            id: "10",
            title: "GraphQL vs REST API",
            snippet:
                "Comparing GraphQL and REST API approaches for building modern applications",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/10",
        },
        {
            id: "11",
            title: "Web Accessibility (a11y) Guide",
            snippet:
                "Making your React applications accessible to all users with ARIA attributes and semantic HTML",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/11",
        },
        {
            id: "12",
            title: "Deploying Next.js to Production",
            snippet:
                "Step-by-step guide to deploying Next.js applications to Vercel, AWS, and other platforms",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/12",
        },
    ].sort((a, b) => {
        return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }),
};

export const Default = meta.story({
    args: {
        onSelect: fn(),
    },
    render: args => {
        return (
            <div className="h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search>
                    <SearchInput placeholder="Search commands..." />
                    <SearchList>
                        <SearchGroup heading="Quick Actions">
                            <SearchItem
                                itemId="item-1"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconSettings />
                                Settings
                            </SearchItem>
                            <SearchItem
                                itemId="item-2"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconUser />
                                Profile
                            </SearchItem>
                            <SearchItem
                                itemId="item-3"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconMessageCircle />
                                Messages
                            </SearchItem>
                        </SearchGroup>
                        <SearchSeparator />
                        <SearchGroup heading="Files & Folders">
                            <SearchItem
                                itemId="item-4"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconFile />
                                Documents
                            </SearchItem>
                            <SearchItem
                                itemId="item-5"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconFolder />
                                Projects
                            </SearchItem>
                            <SearchItem
                                itemId="item-6"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconSearch />
                                Search Files
                            </SearchItem>
                        </SearchGroup>
                        <SearchSeparator />
                        <SearchGroup heading="System">
                            <SearchItem
                                itemId="item-7"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconBell />
                                Notifications
                            </SearchItem>
                            <SearchItem
                                itemId="item-8"
                                // @ts-expect-error - onSelect is a function
                                onSelect={args.onSelect}
                            >
                                <IconTrash />
                                Trash
                            </SearchItem>
                        </SearchGroup>
                    </SearchList>
                </Search>
            </div>
        );
    },
});

Default.test("should render search input", ({ canvas }) => {
    const input = canvas.getByRole("combobox");
    expect(input).toBeVisible();
});

Default.test("should render search items", ({ canvas }) => {
    const items = canvas.getAllByRole("option");
    expect(items.length).toBeGreaterThan(0);

    items.forEach(item => {
        expect(item).toBeVisible();
    });
});

Default.test("should have first item selected by default", ({ canvas }) => {
    const items = canvas.getAllByRole("option");
    expect(items[0]).toHaveAttribute("aria-selected", "true");
    expect(items[1]).toHaveAttribute("aria-selected", "false");
    expect(items[2]).toHaveAttribute("aria-selected", "false");
    expect(items[3]).toHaveAttribute("aria-selected", "false");
    expect(items[4]).toHaveAttribute("aria-selected", "false");
    expect(items[5]).toHaveAttribute("aria-selected", "false");
    expect(items[6]).toHaveAttribute("aria-selected", "false");
    expect(items[7]).toHaveAttribute("aria-selected", "false");
});

Default.test(
    "should select item on click",
    async ({ canvas, userEvent, args }) => {
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.click(items[0]);
        expect(args.onSelect).toHaveBeenCalledWith("item-1");
        expectAriaSelected(items, 0);

        await userEvent.click(items[1]);
        expect(args.onSelect).toHaveBeenCalledWith("item-2");
        expectAriaSelected(items, 1);

        await userEvent.click(items[2]);
        expect(args.onSelect).toHaveBeenCalledWith("item-3");
        expectAriaSelected(items, 2);
    },
);

Default.test(
    "should navigate between items with arrow keys",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        expect(input).toHaveFocus();

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        const items = canvas.getAllByRole("option");

        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 2);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 3);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 4);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 3);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 2);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);
    },
);

Default.test(
    "should stay on first item when pressing arrow up at start",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        expect(input).toHaveFocus();

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        const items = canvas.getAllByRole("option");
        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);
    },
);

Default.test(
    "should stay on last item when pressing arrow down at end",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        expect(input).toHaveFocus();

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }
        const items = canvas.getAllByRole("option");

        await waitFor(() => {
            items.forEach(async () => {
                await userEvent.keyboard("{arrowdown}");
            });
        });

        expectAriaSelected(items, 7);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 7);
    },
);

Default.test(
    "should select item on enter key",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        expect(input).toHaveFocus();

        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-1");

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-2");

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-3");

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-4");

        await userEvent.keyboard("{arrowup}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-3");

        await userEvent.keyboard("{arrowup}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-2");

        await userEvent.keyboard("{arrowup}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith("item-1");
    },
);

Default.test("should allow typing in input", async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox");
    await userEvent.click(input);
    expect(input).toHaveFocus();

    await userEvent.type(input, "Settings");
    expect(input).toHaveValue("Settings");
});

export const WithItems = meta.story({
    args: {},
    render: args => {
        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput placeholder="Search..." />
                    <SearchList>
                        <SearchItem itemId="item-1" onSelect={fn()}>
                            <IconSettings />
                            Settings
                        </SearchItem>
                        <SearchItem itemId="item-2" onSelect={fn()}>
                            <IconUser />
                            Profile
                        </SearchItem>
                        <SearchItem itemId="item-3" onSelect={fn()}>
                            <IconMessageCircle />
                            Messages
                        </SearchItem>
                    </SearchList>
                </Search>
            </div>
        );
    },
});

export const WithGroupsAndItems = meta.story({
    args: {},
    render: args => {
        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput placeholder="Search..." />
                    <SearchList>
                        <SearchGroup heading="Recent">
                            <SearchItem itemId="recent-1" onSelect={fn()}>
                                <IconMessageCircle />
                                Recent Chat 1
                            </SearchItem>
                            <SearchItem itemId="recent-2" onSelect={fn()}>
                                <IconMessageCircle />
                                Recent Chat 2
                            </SearchItem>
                        </SearchGroup>
                        <SearchGroup heading="All Chats">
                            <SearchItem itemId="chat-1" onSelect={fn()}>
                                <IconMessageCircle />
                                Chat 1
                            </SearchItem>
                            <SearchItem itemId="chat-2" onSelect={fn()}>
                                <IconMessageCircle />
                                Chat 2
                            </SearchItem>
                        </SearchGroup>
                    </SearchList>
                </Search>
            </div>
        );
    },
});

WithGroupsAndItems.test("should render search groups", async ({ canvas }) => {
    const recentGroup = canvas.getByText("Recent");
    expect(recentGroup).toBeVisible();

    const allChatsGroup = canvas.getByText("All Chats");
    expect(allChatsGroup).toBeVisible();
});

export const WithControlledSearch = meta.story({
    args: {},
    render: args => {
        const [value, setValue] = useState("");

        const allItems = [
            {
                id: "item-1",
                icon: IconSettings,
                label: "Settings",
                group: "Quick Actions",
            },
            {
                id: "item-2",
                icon: IconUser,
                label: "Profile",
                group: "Quick Actions",
            },
            {
                id: "item-3",
                icon: IconMessageCircle,
                label: "Messages",
                group: "Quick Actions",
            },
            {
                id: "item-4",
                icon: IconFile,
                label: "Documents",
                group: "Files & Folders",
            },
            {
                id: "item-5",
                icon: IconFolder,
                label: "Projects",
                group: "Files & Folders",
            },
            {
                id: "item-6",
                icon: IconSearch,
                label: "Search Files",
                group: "Files & Folders",
            },
            {
                id: "item-7",
                icon: IconBell,
                label: "Notifications",
                group: "System",
            },
            { id: "item-8", icon: IconTrash, label: "Trash", group: "System" },
        ];

        const filteredItems = value
            ? allItems.filter(item =>
                  item.label.toLowerCase().includes(value.toLowerCase()),
              )
            : allItems;

        const groupedItems = filteredItems.reduce(
            (acc, item) => {
                if (!acc[item.group]) {
                    acc[item.group] = [];
                }
                acc[item.group].push(item);
                return acc;
            },
            {} as Record<string, typeof allItems>,
        );

        const groups = Object.keys(groupedItems);

        return (
            <div className="h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput
                        placeholder="Search commands..."
                        value={value}
                        onValueChange={setValue}
                    />
                    <SearchList>
                        {groups.length > 0 ? (
                            groups.map((groupName, groupIndex) => (
                                <React.Fragment key={groupName}>
                                    <SearchGroup heading={groupName}>
                                        {groupedItems[groupName].map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <SearchItem
                                                    key={item.id}
                                                    itemId={item.id}
                                                    onSelect={fn()}
                                                >
                                                    <Icon />
                                                    {item.label}
                                                </SearchItem>
                                            );
                                        })}
                                    </SearchGroup>
                                    {groupIndex < groups.length - 1 && (
                                        <SearchSeparator />
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <SearchEmpty>No results found</SearchEmpty>
                        )}
                    </SearchList>
                </Search>
            </div>
        );
    },
});

WithControlledSearch.test(
    "should filter items based on search query",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "Settings");

        expect(canvas.getByText("Settings")).toBeVisible();
        const items = canvas.getAllByRole("option");
        expect(items).toHaveLength(1);
    },
);

WithControlledSearch.test(
    "should show empty state when no matches",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "Nonexistent");

        const items = canvas.queryAllByRole("option");
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent("No results found");
    },
);

export const WithEmptyState = meta.story({
    args: {},
    render: args => {
        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput placeholder="Search..." />
                    <SearchList>
                        <SearchEmpty>No results found</SearchEmpty>
                    </SearchList>
                </Search>
            </div>
        );
    },
});

WithEmptyState.test("should show empty state", async ({ canvas }) => {
    const emptyMessage = canvas.getByText("No results found");
    expect(emptyMessage).toBeVisible();
});

export const WithErrorState = meta.story({
    args: {},
    render: args => {
        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput placeholder="Search..." />
                    <SearchList>
                        <SearchError>Failed to load results</SearchError>
                    </SearchList>
                </Search>
            </div>
        );
    },
});

WithErrorState.test("should show error state", async ({ canvas }) => {
    const errorMessage = canvas.getByText("Failed to load results");
    expect(errorMessage).toBeVisible();
});

export const WithLoadingState = meta.story({
    args: {},
    render: args => {
        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput placeholder="Search..." />
                    <SearchList>
                        <SearchGroupSkeleton length={3} />
                    </SearchList>
                </Search>
            </div>
        );
    },
});

WithLoadingState.test("should show loading skeletons", async ({ canvas }) => {
    const skeletons = canvas.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
});

export const WithSearchResults = meta.story({
    parameters: {
        nextjs: {
            appDirectory: true,
            router: {
                pathname: "/chat/1", // Match the first item's href
            },
        },
    },
    args: {
        value: "test",
    },
    render: args => {
        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput placeholder="Search chats..." />
                    <SearchList>
                        <SearchResultsList
                            data={mockSearchResults}
                            query={args.value}
                        />
                    </SearchList>
                </Search>
            </div>
        );
    },
});

export const WithControlledSearchResults = meta.story({
    parameters: {
        nextjs: {
            appDirectory: true,
            router: {
                pathname: "/chat/[id]",
                asPath: "/chat/1",
                query: { id: "1" },
            },
        },
    },
    args: {
        value: "",
        onSelect: fn(),
    },
    render: args => {
        const [value, setValue] = useState("");

        // Filter search results based on search query
        const filteredResults = value
            ? mockSearchResults.filter(
                  result =>
                      result.title
                          .toLowerCase()
                          .includes(value.toLowerCase()) ||
                      result.snippet
                          ?.toLowerCase()
                          .includes(value.toLowerCase()),
              )
            : mockSearchResults;

        const hasResults = filteredResults.length > 0;

        return (
            <div className="h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput
                        placeholder="Search chats..."
                        value={value}
                        onValueChange={newValue => {
                            setValue(newValue);
                            args.onValueChange?.(newValue);
                        }}
                    />
                    <SearchList>
                        {hasResults ? (
                            <SearchResultsList
                                data={filteredResults}
                                query={value}
                                onSelect={result => {
                                    // @ts-expect-error - onSelect is a function that takes a result
                                    args.onSelect?.(result);
                                }}
                            />
                        ) : (
                            <SearchEmpty>No results found</SearchEmpty>
                        )}
                    </SearchList>
                </Search>
            </div>
        );
    },
});
WithControlledSearchResults.test(
    "should render all search result items",
    ({ canvas }) => {
        const items = canvas.getAllByRole("option");
        expect(items.length).toBeGreaterThan(0);

        items.forEach(item => {
            expect(item).toBeVisible();
        });
    },
);

WithControlledSearchResults.test(
    "should auto-select first item by default",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        const items = canvas.getAllByRole("option");
        expect(items[0]).toHaveAttribute("aria-selected", "true");
        expect(items[1]).toHaveAttribute("aria-selected", "false");
    },
);

WithControlledSearchResults.test(
    "should auto-select first filtered item",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        const items = canvas.getAllByRole("option");
        expect(items[0]).toHaveAttribute("aria-selected", "true");
        expect(items[1]).toHaveAttribute("aria-selected", "false");
    },
);

WithControlledSearchResults.test(
    "should call onSelect with item data on click",
    async ({ canvas, userEvent, args }) => {
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.click(items[0]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
        expectAriaSelected(items, 0);

        await userEvent.click(items[1]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[1]);
        expectAriaSelected(items, 1);

        await userEvent.click(items[2]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);
        expectAriaSelected(items, 2);
    },
);

WithControlledSearchResults.test(
    "should call onSelect with correct filtered item on click",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.click(items[0]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
        expectAriaSelected(items, 0);

        await userEvent.click(items[1]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);
        expectAriaSelected(items, 1);
    },
);

WithControlledSearchResults.test(
    "should call onSelect with item data on enter key",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[1]);
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);
        expectAriaSelected(items, 2);
    },
);

WithControlledSearchResults.test(
    "should call onSelect with correct filtered item on enter key",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);
        expectAriaSelected(items, 1);
    },
);

WithControlledSearchResults.test(
    "should call onValueChange on hover",
    async ({ canvas, userEvent, args }) => {
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.hover(items[0]);
        expect(args.onValueChange).toHaveBeenCalledWith("1");
        expectAriaSelected(items, 0);

        await userEvent.hover(items[1]);
        expect(args.onValueChange).toHaveBeenCalledWith("2");
        expectAriaSelected(items, 1);

        await userEvent.hover(items[2]);
        expect(args.onValueChange).toHaveBeenCalledWith("3");
        expectAriaSelected(items, 2);
    },
);

WithControlledSearchResults.test(
    "should call onValueChange on arrow key navigation",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        expect(args.onValueChange).toHaveBeenCalledWith("1");
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        expect(args.onValueChange).toHaveBeenCalledWith("2");
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowdown}");
        expect(args.onValueChange).toHaveBeenCalledWith("3");
        expectAriaSelected(items, 2);
    },
);

WithControlledSearchResults.test(
    "should call onValueChange on hover over filtered items",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.hover(items[0]);
        expect(args.onValueChange).toHaveBeenCalledWith("1");
        expectAriaSelected(items, 0);

        await userEvent.hover(items[1]);
        expect(args.onValueChange).toHaveBeenCalledWith("3");
        expectAriaSelected(items, 1);
    },
);

WithControlledSearchResults.test(
    "should call onValueChange on arrow key navigation with filtered items",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        expect(args.onValueChange).toHaveBeenCalledWith("1");
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        expect(args.onValueChange).toHaveBeenCalledWith("3");
        expectAriaSelected(items, 1);
    },
);

WithControlledSearchResults.test(
    "should navigate to item href on click",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to something that doesn't match any item's href
        window.history.replaceState({}, "", "/");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        const items = canvas.getAllByRole("option");

        await userEvent.click(items[0]);
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[0].href,
        );

        await userEvent.click(items[1]);
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[1].href,
        );

        await userEvent.click(items[2]);
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[2].href,
        );

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should navigate to item href on enter key",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to something that doesn't match any item's href
        window.history.replaceState({}, "", "/");

        // Clear any previous router.push calls
        getRouter().push.mockClear();
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[0].href,
        );

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[1].href,
        );

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[2].href,
        );

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should navigate to filtered item href on click",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to something that doesn't match any item's href
        window.history.replaceState({}, "", "/");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        const items = canvas.getAllByRole("option");

        await userEvent.click(items[0]);
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[0].href,
        );

        await userEvent.click(items[1]);
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[2].href,
        );

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should navigate to filtered item href on enter key",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to something that doesn't match any item's href
        window.history.replaceState({}, "", "/");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[0].href,
        );

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[2].href,
        );

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should navigate to item href on enter key after clearing query",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to something that doesn't match any item's href
        window.history.replaceState({}, "", "/");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[0].href,
        );

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[1].href,
        );

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(getRouter().push).toHaveBeenCalledWith(
            mockSearchResults[2].href,
        );

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should skip navigation on click when already on item page",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to match first item's href (/chat/1)
        window.history.replaceState({}, "", "/chat/1");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        const items = canvas.getAllByRole("option");

        await userEvent.click(items[0]);

        expect(getRouter().push).not.toHaveBeenCalled();

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should skip navigation on enter when already on item page",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to match first item's href (/chat/1)
        window.history.replaceState({}, "", "/chat/1");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        await userEvent.keyboard("{enter}");

        expect(getRouter().push).not.toHaveBeenCalled();

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should skip navigation on filtered item click when already on item page",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;

        // Set pathname to match first item's href (/chat/1)
        window.history.replaceState({}, "", "/chat/1");

        // Clear any previous router.push calls
        getRouter().push.mockClear();

        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        const items = canvas.getAllByRole("option");

        await userEvent.click(items[0]);

        expect(getRouter().push).not.toHaveBeenCalled();

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithControlledSearchResults.test(
    "should update aria-selected on filtered item click",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        const items = canvas.getAllByRole("option");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        await userEvent.click(items[0]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
        expectAriaSelected(items, 0);

        await userEvent.click(items[1]);
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);
        expectAriaSelected(items, 1);
    },
);

WithControlledSearchResults.test(
    "should navigate between items with arrow keys",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        const items = canvas.getAllByRole("option");

        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 2);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);
    },
);

WithControlledSearchResults.test(
    "should navigate between filtered items with arrow keys",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        const items = canvas.getAllByRole("option");

        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);
    },
);

WithControlledSearchResults.test(
    "should stay on first item when pressing arrow up at start",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        const items = canvas.getAllByRole("option");
        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);
    },
);

WithControlledSearchResults.test(
    "should stay on first filtered item when pressing arrow up at start",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }

        const items = canvas.getAllByRole("option");
        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);

        await userEvent.keyboard("{arrowup}");
        expectAriaSelected(items, 0);
    },
);

WithControlledSearchResults.test(
    "should stay on last item when pressing arrow down at end",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }
        const items = canvas.getAllByRole("option");

        await waitFor(() => {
            items.forEach(async () => {
                await userEvent.keyboard("{arrowdown}");
            });
        });

        expectAriaSelected(items, 2);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 2);
    },
);

WithControlledSearchResults.test(
    "should stay on last filtered item when pressing arrow down at end",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        function expectAriaSelected(
            items: HTMLElement[],
            selectedIndex: number,
        ) {
            items.forEach((item, index) => {
                if (index === selectedIndex) {
                    expect(item).toHaveAttribute("aria-selected", "true");
                } else {
                    expect(item).toHaveAttribute("aria-selected", "false");
                }
            });
        }
        const items = canvas.getAllByRole("option");

        await waitFor(() => {
            items.forEach(async () => {
                await userEvent.keyboard("{arrowdown}");
            });
        });

        expectAriaSelected(items, 1);

        await userEvent.keyboard("{arrowdown}");
        expectAriaSelected(items, 1);
    },
);

WithControlledSearchResults.test(
    "should call onSelect on enter key",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");
        await userEvent.keyboard("{backspace}");

        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[1]);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);

        await userEvent.keyboard("{arrowup}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[1]);

        await userEvent.keyboard("{arrowup}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    },
);

WithControlledSearchResults.test(
    "should call onSelect on enter key with filtered items",
    async ({ canvas, userEvent, args }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.click(input);
        await userEvent.type(input, "G");

        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[2]);

        await userEvent.keyboard("{arrowup}");
        await userEvent.keyboard("{enter}");
        expect(args.onSelect).toHaveBeenCalledWith(mockSearchResults[0]);
    },
);

WithControlledSearchResults.test(
    "should filter results based on search query",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "React");

        const items = canvas.getAllByRole("option");
        expect(items).toHaveLength(1);
    },
);

WithControlledSearchResults.test(
    "should show empty state when no matches",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "NonexistentQuery");

        const items = canvas.queryAllByRole("option");
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent("No results found");
    },
);

WithControlledSearchResults.test(
    "should return to initial data when query is cleared",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "NonexistentQuery");

        await userEvent.clear(input);

        const items = canvas.getAllByRole("option");
        expect(items).toHaveLength(3);
    },
);

export const WithGroupedSearchResults = meta.story({
    args: {
        value: "",
    },
    render: args => {
        const [value, setValue] = useState("");
        return (
            <div className="h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search
                    {...args}
                    value={value}
                    onValueChange={newValue => {
                        setValue(newValue);
                        args.onValueChange?.(newValue);
                    }}
                >
                    <SearchInput placeholder="Search chats..." />
                    <SearchList>
                        <SearchResultsList
                            data={groupedSearchResults}
                            query={value}
                        />
                    </SearchList>
                </Search>
            </div>
        );
    },
});

// Initial data shown when no query
const initialSearchData: SearchResultsItemResult[] = [
    {
        id: "initial-1",
        title: "Welcome to CloneGPT",
        snippet: "Get started with your first conversation",
        updatedAt: today.toISOString(),
        createdAt: today.toISOString(),
        href: "/chat/initial-1",
    },
    {
        id: "initial-2",
        title: "Quick Start Guide",
        snippet: "Learn how to use CloneGPT effectively",
        updatedAt: yesterday.toISOString(),
        createdAt: yesterday.toISOString(),
        href: "/chat/initial-2",
    },
    {
        id: "initial-3",
        title: "Tips & Tricks",
        snippet: "Discover advanced features and shortcuts",
        updatedAt: fixedDate1.toISOString(),
        createdAt: fixedDate1.toISOString(),
        href: "/chat/initial-3",
    },
];

// Function to get search results based on query (like useInfiniteSearchUserChats)
const getSearchResults = (query: string): SearchResultsItemResult[] => {
    if (!query) return [];

    // Filter mockSearchResults based on query (simulating API search)
    return mockSearchResults.filter(
        result =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.snippet?.toLowerCase().includes(query.toLowerCase()),
    );
};

export const WithInitialAndSearchResults = meta.story({
    args: {
        value: "",
    },
    render: args => {
        const [value, setValue] = useState("");
        const [isSearching, setIsSearching] = useState(false);
        const [searchResults, setSearchResults] = useState<
            SearchResultsItemResult[]
        >([]);

        // Simulate async search like the real component
        const handleSearch = (query: string) => {
            setValue(query);
            if (query) {
                setIsSearching(true);
                // Simulate API delay
                setTimeout(() => {
                    const results = getSearchResults(query);
                    setSearchResults(results);
                    setIsSearching(false);
                }, 300);
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        };

        const showInitialData = !value && initialSearchData;
        const hasSearchResults =
            value && !isSearching && searchResults.length > 0;
        const isEmpty = value && !isSearching && searchResults.length === 0;

        return (
            <div className="h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput
                        placeholder="Search chats..."
                        value={value}
                        onValueChange={handleSearch}
                    />
                    <SearchList>
                        {showInitialData && (
                            <SearchResultsList data={initialSearchData} />
                        )}

                        {isSearching && <SearchGroupSkeleton length={3} />}

                        {hasSearchResults && (
                            <SearchResultsList
                                data={searchResults}
                                query={value}
                            />
                        )}

                        {isEmpty && <SearchEmpty>No chats found</SearchEmpty>}
                    </SearchList>
                </Search>
            </div>
        );
    },
});

WithInitialAndSearchResults.test(
    "should show initial data when query is empty",
    async ({ canvas }) => {
        const items = canvas.getAllByRole("option");
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent("Welcome to CloneGPT");
        expect(items[1]).toHaveTextContent("Quick Start Guide");
        expect(items[2]).toHaveTextContent("Tips & Tricks");
    },
);

WithInitialAndSearchResults.test(
    "should show search results when querying",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "React");

        await waitFor(() => {
            const items = canvas.getAllByRole("option");
            expect(items).toHaveLength(1);
            expect(items[0]).toHaveTextContent("Getting Started with React");
        });
    },
);

WithInitialAndSearchResults.test(
    "should show empty state when no matches",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "NonexistentQuery");

        await waitFor(
            () => {
                const emptyMessage = canvas.getByText("No chats found");
                expect(emptyMessage).toBeVisible();
            },
            { timeout: 1000 },
        );
    },
);

WithInitialAndSearchResults.test(
    "should auto-select first search result item",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "React");

        await waitFor(
            () => {
                const items = canvas.getAllByRole("option");
                expect(items[0]).toHaveAttribute("aria-selected", "true");
            },
            { timeout: 1000 },
        );
    },
);

WithInitialAndSearchResults.test(
    "should navigate between search results with arrow keys",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "a"); // Search for items containing "a"

        await waitFor(
            () => {
                const items = canvas.getAllByRole("option");
                expect(items.length).toBeGreaterThan(1);
            },
            { timeout: 1000 },
        );

        const items = canvas.getAllByRole("option");
        expect(items[0]).toHaveAttribute("aria-selected", "true");

        await userEvent.keyboard("{arrowdown}");
        expect(items[1]).toHaveAttribute("aria-selected", "true");
        expect(items[0]).toHaveAttribute("aria-selected", "false");

        await userEvent.keyboard("{arrowup}");
        expect(items[0]).toHaveAttribute("aria-selected", "true");
        expect(items[1]).toHaveAttribute("aria-selected", "false");
    },
);

WithInitialAndSearchResults.test(
    "should navigate to item href on click",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;
        window.history.replaceState({}, "", "/");
        getRouter().push.mockClear();

        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "React");

        await waitFor(
            () => {
                const items = canvas.getAllByRole("option");
                expect(items).toHaveLength(1);
            },
            { timeout: 1000 },
        );

        const items = canvas.getAllByRole("option");
        await userEvent.click(items[0]);

        expect(getRouter().push).toHaveBeenCalledWith("/chat/1");

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithInitialAndSearchResults.test(
    "should navigate to item href on enter key",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;
        window.history.replaceState({}, "", "/");
        getRouter().push.mockClear();

        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "React");

        await waitFor(
            () => {
                const items = canvas.getAllByRole("option");
                expect(items).toHaveLength(1);
            },
            { timeout: 1000 },
        );

        await userEvent.keyboard("{enter}");

        expect(getRouter().push).toHaveBeenCalledWith("/chat/1");

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithInitialAndSearchResults.test(
    "should skip navigation when already on item page",
    async ({ canvas, userEvent }) => {
        // Save original pathname
        const originalPathname = window.location.pathname;
        window.history.replaceState({}, "", "/chat/1"); // Match the React item's href
        getRouter().push.mockClear();

        const input = canvas.getByRole("combobox");
        await userEvent.type(input, "React");

        await waitFor(
            () => {
                const items = canvas.getAllByRole("option");
                expect(items).toHaveLength(1);
            },
            { timeout: 1000 },
        );

        const items = canvas.getAllByRole("option");
        await userEvent.click(items[0]);

        expect(getRouter().push).not.toHaveBeenCalled();

        // Restore original pathname
        window.history.replaceState({}, "", originalPathname);
    },
);

WithInitialAndSearchResults.test(
    "should return to initial data when clearing search",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByRole("combobox");

        // First verify initial data is shown
        expect(canvas.getByText("Welcome to CloneGPT")).toBeVisible();

        // Type a search query
        await userEvent.type(input, "React");

        await waitFor(
            () => {
                const items = canvas.getAllByRole("option");
                expect(items[0]).toHaveTextContent(
                    "Getting Started with React",
                );
            },
            { timeout: 1000 },
        );

        // Clear the search
        await userEvent.clear(input);

        await waitFor(() => {
            expect(canvas.getByText("Welcome to CloneGPT")).toBeVisible();
        });
    },
);

export const WithHighlightedResults = meta.story({
    args: {
        value: "React",
    },
    render: args => {
        const query = args.value || "";
        const [value, setValue] = useState(query);
        const reactResults = mockSearchResults.filter(
            result =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.snippet?.toLowerCase().includes(query.toLowerCase()),
        );

        return (
            <div className="min-h-[400px] w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-800">
                <Search {...args}>
                    <SearchInput
                        placeholder="Search chats..."
                        value={value}
                        onValueChange={setValue}
                    />
                    <SearchList>
                        <SearchResultsList data={reactResults} query={value} />
                    </SearchList>
                </Search>
            </div>
        );
    },
});

// ============================================================================
// Dialog Stories
// ============================================================================

export const InDialogDefault = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search commands..." />
                            <SearchList>
                                <SearchGroup heading="Quick Actions">
                                    <SearchItem itemId="item-1" onSelect={fn()}>
                                        <IconSettings />
                                        Settings
                                    </SearchItem>
                                    <SearchItem itemId="item-2" onSelect={fn()}>
                                        <IconUser />
                                        Profile
                                    </SearchItem>
                                    <SearchItem itemId="item-3" onSelect={fn()}>
                                        <IconMessageCircle />
                                        Messages
                                    </SearchItem>
                                </SearchGroup>
                                <SearchSeparator />
                                <SearchGroup heading="Files & Folders">
                                    <SearchItem itemId="item-4" onSelect={fn()}>
                                        <IconFile />
                                        Documents
                                    </SearchItem>
                                    <SearchItem itemId="item-5" onSelect={fn()}>
                                        <IconFolder />
                                        Projects
                                    </SearchItem>
                                    <SearchItem itemId="item-6" onSelect={fn()}>
                                        <IconSearch />
                                        Search Files
                                    </SearchItem>
                                </SearchGroup>
                                <SearchSeparator />
                                <SearchGroup heading="System">
                                    <SearchItem itemId="item-7" onSelect={fn()}>
                                        <IconBell />
                                        Notifications
                                    </SearchItem>
                                    <SearchItem itemId="item-8" onSelect={fn()}>
                                        <IconTrash />
                                        Trash
                                    </SearchItem>
                                </SearchGroup>
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogDefault.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

InDialogDefault.test(
    "should open and close dialog with escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

InDialogDefault.test(
    "should close dialog when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        expect(trigger).toBeVisible();
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );

        expect(dialog).toBeInTheDocument();
        const overlay = await waitFor(() => {
            const overlay = document.querySelector(
                '[data-testid="dialog-overlay"]',
            );
            if (!overlay) {
                throw new Error("Overlay not found");
            }
            return overlay;
        });
        expect(overlay).toBeInTheDocument();
        await userEvent.click(overlay);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

export const InDialogWithItems = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search..." />
                            <SearchList>
                                <SearchItem itemId="item-1" onSelect={fn()}>
                                    <IconSettings />
                                    Settings
                                </SearchItem>
                                <SearchItem itemId="item-2" onSelect={fn()}>
                                    <IconUser />
                                    Profile
                                </SearchItem>
                                <SearchItem itemId="item-3" onSelect={fn()}>
                                    <IconMessageCircle />
                                    Messages
                                </SearchItem>
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithItems.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

export const InDialogWithGroupsAndItems = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search..." />
                            <SearchList>
                                <SearchGroup heading="Recent">
                                    <SearchItem
                                        itemId="recent-1"
                                        onSelect={fn()}
                                    >
                                        <IconMessageCircle />
                                        Recent Chat 1
                                    </SearchItem>
                                    <SearchItem
                                        itemId="recent-2"
                                        onSelect={fn()}
                                    >
                                        <IconMessageCircle />
                                        Recent Chat 2
                                    </SearchItem>
                                </SearchGroup>
                                <SearchGroup heading="All Chats">
                                    <SearchItem itemId="chat-1" onSelect={fn()}>
                                        <IconMessageCircle />
                                        Chat 1
                                    </SearchItem>
                                    <SearchItem itemId="chat-2" onSelect={fn()}>
                                        <IconMessageCircle />
                                        Chat 2
                                    </SearchItem>
                                </SearchGroup>
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithGroupsAndItems.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        await userEvent.click(trigger);
    },
);

export const InDialogWithControlledSearch = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        const allItems = [
            {
                id: "item-1",
                icon: IconSettings,
                label: "Settings",
                group: "Quick Actions",
            },
            {
                id: "item-2",
                icon: IconUser,
                label: "Profile",
                group: "Quick Actions",
            },
            {
                id: "item-3",
                icon: IconMessageCircle,
                label: "Messages",
                group: "Quick Actions",
            },
            {
                id: "item-4",
                icon: IconFile,
                label: "Documents",
                group: "Files & Folders",
            },
            {
                id: "item-5",
                icon: IconFolder,
                label: "Projects",
                group: "Files & Folders",
            },
            {
                id: "item-6",
                icon: IconSearch,
                label: "Search Files",
                group: "Files & Folders",
            },
            {
                id: "item-7",
                icon: IconBell,
                label: "Notifications",
                group: "System",
            },
            { id: "item-8", icon: IconTrash, label: "Trash", group: "System" },
        ];

        const filteredItems = value
            ? allItems.filter(item =>
                  item.label.toLowerCase().includes(value.toLowerCase()),
              )
            : allItems;

        const groupedItems = filteredItems.reduce(
            (acc, item) => {
                if (!acc[item.group]) {
                    acc[item.group] = [];
                }
                acc[item.group].push(item);
                return acc;
            },
            {} as Record<string, typeof allItems>,
        );

        const groups = Object.keys(groupedItems);

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search {...args}>
                            <SearchInput
                                value={value}
                                onValueChange={newValue => {
                                    setValue(newValue);
                                    args.onValueChange?.(newValue);
                                }}
                                placeholder="Search commands..."
                            />
                            <SearchList>
                                {groups.length > 0 ? (
                                    groups.map((groupName, groupIndex) => (
                                        <React.Fragment key={groupName}>
                                            <SearchGroup heading={groupName}>
                                                {groupedItems[groupName].map(
                                                    item => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <SearchItem
                                                                key={item.id}
                                                                itemId={item.id}
                                                                onSelect={fn()}
                                                            >
                                                                <Icon />
                                                                {item.label}
                                                            </SearchItem>
                                                        );
                                                    },
                                                )}
                                            </SearchGroup>
                                            {groupIndex < groups.length - 1 && (
                                                <SearchSeparator />
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <SearchEmpty>No results found</SearchEmpty>
                                )}
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithControlledSearch.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        await userEvent.click(trigger);
    },
);

export const InDialogWithEmptyState = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search..." />
                            <SearchList>
                                <SearchEmpty>No results found</SearchEmpty>
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithEmptyState.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

export const InDialogWithErrorState = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search..." />
                            <SearchList>
                                <SearchError>
                                    Failed to load results
                                </SearchError>
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithErrorState.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

export const InDialogWithLoadingState = meta.story({
    args: {},
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search"
                        description="Type to search..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search..." />
                            <SearchList>
                                <SearchGroupSkeleton length={3} />
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithLoadingState.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

export const InDialogWithSearchResults = meta.story({
    args: {
        value: "test",
    },
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState(args.value || "");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search chats..." />
                            <SearchList>
                                <SearchResultsList
                                    data={mockSearchResults}
                                    query={value}
                                />
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithSearchResults.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

export const InDialogWithControlledSearchResults = meta.story({
    args: {
        value: "",
    },
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        // Filter search results based on search query
        const filteredResults = value
            ? mockSearchResults.filter(
                  result =>
                      result.title
                          .toLowerCase()
                          .includes(value.toLowerCase()) ||
                      result.snippet
                          ?.toLowerCase()
                          .includes(value.toLowerCase()),
              )
            : mockSearchResults;

        const hasResults = filteredResults.length > 0;

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search {...args}>
                            <SearchInput
                                placeholder="Search chats..."
                                value={value}
                                onValueChange={newValue => {
                                    setValue(newValue);
                                    args.onValueChange?.(newValue);
                                }}
                            />
                            <SearchList>
                                {hasResults ? (
                                    <SearchResultsList
                                        data={filteredResults}
                                        query={value}
                                    />
                                ) : (
                                    <SearchEmpty>No results found</SearchEmpty>
                                )}
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithControlledSearchResults.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        await userEvent.click(trigger);
    },
);

export const InDialogWithGroupedSearchResults = meta.story({
    args: {
        value: "",
    },
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search chats..." />
                            <SearchList>
                                <SearchResultsList
                                    data={groupedSearchResults}
                                    query={value}
                                />
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithGroupedSearchResults.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        await userEvent.click(trigger);
    },
);

export const InDialogWithInitialAndSearchResults = meta.story({
    args: {
        value: "",
    },
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");
        const [isSearching, setIsSearching] = useState(false);
        const [searchResults, setSearchResults] = useState<
            SearchResultsItemResult[]
        >([]);

        // Simulate async search like the real component
        const handleSearch = (query: string) => {
            setValue(query);
            if (query) {
                setIsSearching(true);
                // Simulate API delay
                setTimeout(() => {
                    const results = getSearchResults(query);
                    setSearchResults(results);
                    setIsSearching(false);
                }, 300);
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        };

        const showInitialData = !value && initialSearchData;
        const hasSearchResults =
            value && !isSearching && searchResults.length > 0;
        const isEmpty = value && !isSearching && searchResults.length === 0;

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search {...args}>
                            <SearchInput
                                placeholder="Search chats..."
                                value={value}
                                onValueChange={newValue => {
                                    setValue(newValue);
                                    handleSearch(newValue);
                                    args.onValueChange?.(newValue);
                                }}
                            />
                            <SearchList>
                                {showInitialData && (
                                    <SearchResultsList
                                        data={initialSearchData}
                                    />
                                )}

                                {isSearching && (
                                    <SearchGroupSkeleton length={3} />
                                )}

                                {hasSearchResults && (
                                    <SearchResultsList
                                        data={searchResults}
                                        query={value}
                                    />
                                )}

                                {isEmpty && (
                                    <SearchEmpty>No chats found</SearchEmpty>
                                )}
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithInitialAndSearchResults.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        await userEvent.click(trigger);
    },
);

export const InDialogWithHighlightedResults = meta.story({
    args: {
        value: "React",
    },
    render: args => {
        const [open, setOpen] = useState(false);
        const query = args.value || "";
        const [value, setValue] = useState(query);
        const reactResults = mockSearchResults.filter(
            result =>
                result.title.toLowerCase().includes(query.toLowerCase()) ||
                result.snippet?.toLowerCase().includes(query.toLowerCase()),
        );

        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Search</Button>
                <SearchDialog open={open} onOpenChange={setOpen}>
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search
                            {...args}
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        >
                            <SearchInput placeholder="Search chats..." />
                            <SearchList>
                                <SearchResultsList
                                    data={reactResults}
                                    query={value}
                                />
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogWithHighlightedResults.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        await userEvent.click(trigger);
    },
);

export const WithDialogTrigger = meta.story({
    args: {},
    render: args => {
        const [value, setValue] = useState("");

        // Filter search results based on search query
        const filteredResults = value
            ? mockSearchResults.filter(
                  result =>
                      result.title
                          .toLowerCase()
                          .includes(value.toLowerCase()) ||
                      result.snippet
                          ?.toLowerCase()
                          .includes(value.toLowerCase()),
              )
            : mockSearchResults;

        const hasResults = filteredResults.length > 0;

        return (
            <SearchDialog>
                <SearchDialogTrigger asChild>
                    <Button>Open Search</Button>
                </SearchDialogTrigger>
                <SearchDialogContent
                    title="Search Chats"
                    description="Type to search your chats..."
                >
                    <Search {...args}>
                        <SearchInput
                            placeholder="Search chats..."
                            value={value}
                            onValueChange={newValue => {
                                setValue(newValue);
                                args.onValueChange?.(newValue);
                            }}
                        />
                        <SearchList>
                            {hasResults ? (
                                <SearchResultsList
                                    data={filteredResults}
                                    query={value}
                                />
                            ) : (
                                <SearchEmpty>No chats found</SearchEmpty>
                            )}
                        </SearchList>
                    </Search>
                </SearchDialogContent>
            </SearchDialog>
        );
    },
});

WithDialogTrigger.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open search/i,
    });
    await userEvent.click(trigger);
});

WithDialogTrigger.test(
    "should open and close dialog with escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

WithDialogTrigger.test(
    "should close dialog when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open search/i,
        });
        expect(trigger).toBeVisible();
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );

        expect(dialog).toBeInTheDocument();
        const overlay = await waitFor(() => {
            const overlay = document.querySelector(
                '[data-testid="dialog-overlay"]',
            );
            if (!overlay) {
                throw new Error("Overlay not found");
            }
            return overlay;
        });
        expect(overlay).toBeInTheDocument();
        await userEvent.click(overlay);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

// ============================================================================
// Fullscreen Dialog Stories
// ============================================================================

export const InDialogFullscreenWithInitialAndSearchResults = meta.story({
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");
        const [isSearching, setIsSearching] = useState(false);
        const [searchResults, setSearchResults] = useState<
            SearchResultsItemResult[]
        >([]);

        // Simulate async search like the real component
        const handleSearch = (query: string) => {
            setValue(query);
            if (query) {
                setIsSearching(true);
                // Simulate API delay
                setTimeout(() => {
                    const results = getSearchResults(query);
                    setSearchResults(results);
                    setIsSearching(false);
                }, 300);
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        };

        const showInitialData = !value && initialSearchData;
        const hasSearchResults =
            value && !isSearching && searchResults.length > 0;
        const isEmpty = value && !isSearching && searchResults.length === 0;

        return (
            <>
                <Button onClick={() => setOpen(true)}>
                    Open Fullscreen Search
                </Button>
                <SearchDialog open={open} onOpenChange={setOpen} fullscreen>
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search {...args}>
                            <SearchInput
                                showCloseButton
                                placeholder="Search chats..."
                                value={value}
                                onValueChange={newValue => {
                                    setValue(newValue);
                                    handleSearch(newValue);
                                    args.onValueChange?.(newValue);
                                }}
                            />
                            <SearchList>
                                {showInitialData && (
                                    <SearchResultsList
                                        data={initialSearchData}
                                    />
                                )}

                                {isSearching && (
                                    <SearchGroupSkeleton length={3} />
                                )}

                                {hasSearchResults && (
                                    <SearchResultsList
                                        data={searchResults}
                                        query={value}
                                    />
                                )}

                                {isEmpty && (
                                    <SearchEmpty>No chats found</SearchEmpty>
                                )}
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogFullscreenWithInitialAndSearchResults.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open fullscreen search/i,
        });
        await userEvent.click(trigger);
    },
);

export const InDialogFullscreenLgWithControlledSearchResults = meta.story({
    globals: {
        viewport: { value: "ipad", isRotated: false },
    },
    render: args => {
        const [open, setOpen] = useState(false);
        const [value, setValue] = useState("");

        // Filter search results based on search query
        const filteredResults = value
            ? mockSearchResults.filter(
                  result =>
                      result.title
                          .toLowerCase()
                          .includes(value.toLowerCase()) ||
                      result.snippet
                          ?.toLowerCase()
                          .includes(value.toLowerCase()),
              )
            : mockSearchResults;

        const hasResults = filteredResults.length > 0;

        return (
            <>
                <Button onClick={() => setOpen(true)}>
                    Open Fullscreen LG Search
                </Button>
                <SearchDialog
                    open={open}
                    onOpenChange={setOpen}
                    fullscreen="lg"
                >
                    <SearchDialogContent
                        title="Search Chats"
                        description="Type to search your chats..."
                    >
                        <Search {...args}>
                            <SearchInput
                                showCloseButton
                                placeholder="Search chats..."
                                value={value}
                                onValueChange={newValue => {
                                    setValue(newValue);
                                    args.onValueChange?.(newValue);
                                }}
                            />
                            <SearchList>
                                {hasResults ? (
                                    <SearchResultsList
                                        data={filteredResults}
                                        query={value}
                                    />
                                ) : (
                                    <SearchEmpty>No chats found</SearchEmpty>
                                )}
                            </SearchList>
                        </Search>
                    </SearchDialogContent>
                </SearchDialog>
            </>
        );
    },
});

InDialogFullscreenLgWithControlledSearchResults.test(
    "should open",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open fullscreen lg search/i,
        });
        await userEvent.click(trigger);
    },
);

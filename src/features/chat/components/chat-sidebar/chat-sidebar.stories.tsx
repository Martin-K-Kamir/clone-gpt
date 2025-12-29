import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_ID,
    createMockChats,
    createMockPaginatedChats,
} from "#.storybook/lib/mocks/chats";
import preview from "#.storybook/preview";
import { Suspense } from "react";
import { expect, mocked } from "storybook/test";

import { SidebarProvider, SidebarWrapper } from "@/components/ui/sidebar";

import { auth } from "@/features/auth/services/auth";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import { getUserChats as getUserChatsDB } from "@/features/chat/services/db";

import { ChatSidebar } from "./chat-sidebar";
import { ChatSidebarSkeleton } from "./chat-sidebar-skeleton";

const DEFAULT_CHATS_LENGTH = 20;

const meta = preview.meta({
    component: ChatSidebar,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <SidebarProvider>
                    <ChatSearchDialogClient>
                        <SidebarWrapper className="max-h-svh">
                            <Suspense fallback={<ChatSidebarSkeleton />}>
                                <Story />
                            </Suspense>
                        </SidebarWrapper>
                    </ChatSearchDialogClient>
                </SidebarProvider>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: `/chat/${MOCK_CHAT_ID}`,
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
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

export const Error = meta.story({
    name: "Error",
    beforeEach: () => {
        mocked(getUserChatsDB).mockImplementation(async () => {
            throw new globalThis.Error("Failed to fetch user chats");
        });
    },
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

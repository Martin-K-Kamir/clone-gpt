import preview from "#.storybook/preview";
import { QueryProvider, getQueryClient } from "@/providers/query-provider";
import { HttpResponse, http } from "msw";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { SessionSyncProvider } from "@/features/auth/providers";

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

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId, UIUser } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";
import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";

import {
    UserSidebarItemDropdownMenu,
    UserSidebarItemDropdownMenuTrigger,
} from "./user-sidebar-item-dropdown-menu";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
};

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

const meta = preview.meta({
    component: UserSidebarItemDropdownMenu,
    decorators: [
        Story => (
            <QueryProvider>
                <UserSessionProvider>
                    <SessionSyncProvider>
                        <ChatOffsetProvider>
                            <ChatCacheSyncProvider>
                                <UserCacheSyncProvider>
                                    <Story />
                                    <Toaster />
                                </UserCacheSyncProvider>
                            </ChatCacheSyncProvider>
                        </ChatOffsetProvider>
                    </SessionSyncProvider>
                </UserSessionProvider>
            </QueryProvider>
        ),
    ],
    argTypes: {
        user: {
            description: "The user object",
            table: {
                type: {
                    summary: "UIUser",
                },
            },
        },
        showSettings: {
            control: "boolean",
            description: "Whether to show the User Settings option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        showChatPreferences: {
            control: "boolean",
            description: "Whether to show the Chat Preferences option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        showSharedChats: {
            control: "boolean",
            description: "Whether to show the Shared Chats option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        showLogout: {
            control: "boolean",
            description: "Whether to show the Log out option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        showLogin: {
            control: "boolean",
            description: "Whether to show the Log in option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
    },
    args: {
        user: mockUser,
        showSettings: true,
        showChatPreferences: true,
        showSharedChats: true,
        showLogout: true,
        showLogin: true,
    },
});

export const Default = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open User Sidebar Menu</Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
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

                    // Return 5 chats for this story
                    const totalChats = 5;
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

        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
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
        mocked(updateUserName).mockClear();
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

Default.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const menu = document.querySelector('[role="menu"]');
            expect(menu).toBeInTheDocument();
        });
    },
);

Default.test(
    "should display all menu items when all options are enabled",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const menu = document.querySelector('[role="menu"]');
            expect(menu).toBeInTheDocument();
        });

        const menuItems = document.querySelectorAll('[role="menuitem"]');
        expect(menuItems.length).toBeGreaterThan(0);

        const menuTexts = Array.from(menuItems).map(item => item.textContent);
        expect(menuTexts.some(text => text?.includes("User Settings"))).toBe(
            true,
        );
        expect(menuTexts.some(text => text?.includes("Chat Preferences"))).toBe(
            true,
        );
        expect(menuTexts.some(text => text?.includes("Shared Chats"))).toBe(
            true,
        );
        expect(menuTexts.some(text => text?.includes("Log out"))).toBe(true);
        expect(menuTexts.some(text => text?.includes("Log in"))).toBe(true);
    },
);

Default.test(
    "should open user profile dialog when user settings is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const userSettingsButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(button =>
                button.textContent?.includes("User Settings"),
            );
        });
        await userEvent.click(userSettingsButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should open chat preferences dialog when chat preferences is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const chatPreferencesButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(button =>
                button.textContent?.includes("Chat Preferences"),
            );
        });
        await userEvent.click(chatPreferencesButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should open shared chats dialog when shared chats is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const sharedChatsButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(button =>
                button.textContent?.includes("Shared Chats"),
            );
        });
        await userEvent.click(sharedChatsButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should render shared chats table with data when dialog opens",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const sharedChatsButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(button =>
                button.textContent?.includes("Shared Chats"),
            );
        });
        await userEvent.click(sharedChatsButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });

        await waitFor(() => {
            const table = canvas.getByRole("table");
            expect(table).toBeInTheDocument();

            // Should have header row + 5 data rows
            const rows = canvas.getAllByRole("row");
            expect(rows.length).toBe(6);
        });
    },
);

Default.test(
    "should display chat titles in the shared chats table",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const sharedChatsButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(button =>
                button.textContent?.includes("Shared Chats"),
            );
        });
        await userEvent.click(sharedChatsButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });

        await waitFor(() => {
            const links = canvas.getAllByRole("link");
            expect(links.length).toBeGreaterThan(0);

            // Verify first chat link exists
            const firstLink = links[0];
            expect(firstLink).toHaveAttribute("href", "/chat/chat-0");
        });
    },
);

Default.test(
    "should open login dialog when log in is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const loginButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(button =>
                button.textContent?.includes("Log in"),
            );
        });
        await userEvent.click(loginButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

export const WithoutSettings = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open User Sidebar Menu</Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        showSettings: false,
    },
});

WithoutSettings.test(
    "should not display user settings option when showSettings is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("User Settings");
        });
    },
);

export const WithoutChatPreferences = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open User Sidebar Menu</Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        showChatPreferences: false,
    },
});

WithoutChatPreferences.test(
    "should not display chat preferences option when showChatPreferences is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Chat Preferences");
        });
    },
);

export const WithoutSharedChats = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open User Sidebar Menu</Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        showSharedChats: false,
    },
});

WithoutSharedChats.test(
    "should not display shared chats option when showSharedChats is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Shared Chats");
        });
    },
);

export const WithoutLogout = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open User Sidebar Menu</Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        showLogout: false,
    },
});

WithoutLogout.test(
    "should not display log out option when showLogout is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Log out");
        });
    },
);

export const WithoutLogin = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open User Sidebar Menu</Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        showLogin: false,
    },
});

WithoutLogin.test(
    "should not display log in option when showLogin is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open user sidebar menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Log in");
        });
    },
);

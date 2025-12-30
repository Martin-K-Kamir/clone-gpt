import { AppProviders } from "#.storybook/lib/decorators/providers";
import { createMockChats } from "#.storybook/lib/mocks/chats";
import {
    MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU,
    MOCK_USER_MENU_CHAT_PREFERENCES,
    MOCK_USER_MENU_LOG_IN,
    MOCK_USER_MENU_LOG_OUT,
    MOCK_USER_MENU_SHARED_CHATS,
    MOCK_USER_MENU_USER_SETTINGS,
} from "#.storybook/lib/mocks/user-components";
import { createMockUser } from "#.storybook/lib/mocks/users";
import { createSharedChatsHandler } from "#.storybook/lib/msw/handlers";
import {
    getAllMenuItems,
    hasMenuItemWithText,
} from "#.storybook/lib/utils/elements";
import { clearUserSharedChatsQueries } from "#.storybook/lib/utils/query-client";
import {
    waitForDialog,
    waitForDropdownMenu,
    waitForElement,
    waitForMenuItemByText,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";
import {
    setAllUserChatsVisibility,
    updateManyChatsVisibility,
} from "@/features/chat/services/actions";

import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import {
    UserSidebarItemDropdownMenu,
    UserSidebarItemDropdownMenuTrigger,
} from "./user-sidebar-item-dropdown-menu";

const mockUser = createMockUser();
const mockChats = createMockChats({
    length: 5,
    visibility: CHAT_VISIBILITY.PUBLIC,
});

const meta = preview.meta({
    component: UserSidebarItemDropdownMenu,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
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
                <Button variant="outline">
                    {MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU}
                </Button>
            </UserSidebarItemDropdownMenuTrigger>
        </UserSidebarItemDropdownMenu>
    ),
    parameters: {
        msw: {
            handlers: [
                createSharedChatsHandler({
                    chats: mockChats,
                    hasNextPage: false,
                }),
            ],
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
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
        mocked(updateUserName).mockClear();
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

Default.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();
    },
);

Default.test(
    "should display all menu items when all options are enabled",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        const menuItems = getAllMenuItems();
        expect(menuItems.length).toBeGreaterThan(0);

        expect(hasMenuItemWithText(MOCK_USER_MENU_USER_SETTINGS)).toBe(true);
        expect(hasMenuItemWithText(MOCK_USER_MENU_CHAT_PREFERENCES)).toBe(true);
        expect(hasMenuItemWithText(MOCK_USER_MENU_SHARED_CHATS)).toBe(true);
        expect(hasMenuItemWithText(MOCK_USER_MENU_LOG_OUT)).toBe(true);
        expect(hasMenuItemWithText(MOCK_USER_MENU_LOG_IN)).toBe(true);
    },
);

Default.test(
    "should open user profile dialog when user settings is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        const userSettingsButton = await waitForMenuItemByText(
            MOCK_USER_MENU_USER_SETTINGS,
        );
        await userEvent.click(userSettingsButton);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should open chat preferences dialog when chat preferences is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        const chatPreferencesButton = await waitForMenuItemByText(
            MOCK_USER_MENU_CHAT_PREFERENCES,
        );
        await userEvent.click(chatPreferencesButton);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should open shared chats dialog when shared chats is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        const sharedChatsButton = await waitForMenuItemByText(
            MOCK_USER_MENU_SHARED_CHATS,
        );
        await userEvent.click(sharedChatsButton);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should render shared chats table with data when dialog opens",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        const sharedChatsButton = await waitForMenuItemByText(
            MOCK_USER_MENU_SHARED_CHATS,
        );
        await userEvent.click(sharedChatsButton);

        await waitForDialog("dialog");

        await waitForElement("table");
    },
);

Default.test(
    "should open login dialog when log in is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        const loginButton = await waitForMenuItemByText(MOCK_USER_MENU_LOG_IN);
        await userEvent.click(loginButton);

        await waitForDialog("dialog");
    },
);

export const WithoutSettings = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">
                    {MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU}
                </Button>
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            expect(hasMenuItemWithText(MOCK_USER_MENU_USER_SETTINGS)).toBe(
                false,
            );
        });
    },
);

export const WithoutChatPreferences = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">
                    {MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU}
                </Button>
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            expect(hasMenuItemWithText(MOCK_USER_MENU_CHAT_PREFERENCES)).toBe(
                false,
            );
        });
    },
);

export const WithoutSharedChats = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">
                    {MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU}
                </Button>
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            expect(hasMenuItemWithText(MOCK_USER_MENU_SHARED_CHATS)).toBe(
                false,
            );
        });
    },
);

export const WithoutLogout = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">
                    {MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU}
                </Button>
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            expect(hasMenuItemWithText(MOCK_USER_MENU_LOG_OUT)).toBe(false);
        });
    },
);

export const WithoutLogin = meta.story({
    render: args => (
        <UserSidebarItemDropdownMenu {...args}>
            <UserSidebarItemDropdownMenuTrigger asChild>
                <Button variant="outline">
                    {MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU}
                </Button>
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_USER_SIDEBAR_MENU, "i"),
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            expect(hasMenuItemWithText(MOCK_USER_MENU_LOG_IN)).toBe(false);
        });
    },
);

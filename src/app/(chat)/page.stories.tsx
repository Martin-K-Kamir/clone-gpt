import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_APP_BUTTON_OPEN_USER_MENU,
    MOCK_APP_BUTTON_TOGGLE_SIDEBAR,
    MOCK_APP_USER_EMAIL_DISPLAY,
    MOCK_APP_USER_NAME_DISPLAY,
} from "#.storybook/lib/mocks/app";
import { createMockPaginatedChats } from "#.storybook/lib/mocks/chats";
import {
    MOCK_EMPTY_USER_CHAT_PREFERENCES,
    MOCK_GUEST_SESSION,
    MOCK_GUEST_USER,
    MOCK_SESSION,
    MOCK_USER,
} from "#.storybook/lib/mocks/users";
import { getElementByTestId } from "#.storybook/lib/utils/elements";
import {
    waitForButtonByRole,
    waitForElement,
    waitForTestId,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { Suspense } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import {
    SidebarInset,
    SidebarProvider,
    SidebarWrapper,
} from "@/components/ui/sidebar";

import { auth } from "@/features/auth/services/auth";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";
import {
    ChatSidebar,
    ChatSidebarSkeleton,
} from "@/features/chat/components/chat-sidebar";
import { getUserChats } from "@/features/chat/services/db";

import { getUserChatPreferences } from "@/features/user/services/db";

import PageLoading from "./loading";
import Page from "./page";

const meta = preview.meta({
    component: Page,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <SidebarProvider>
                    <ChatSearchDialogClient>
                        <SidebarWrapper className="max-h-svh">
                            <Suspense fallback={<ChatSidebarSkeleton />}>
                                <ChatSidebar />
                            </Suspense>
                            <SidebarInset>
                                <Suspense fallback={<PageLoading />}>
                                    <Story />
                                </Suspense>
                            </SidebarInset>
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
                pathname: "/",
            },
        },
    },
});

export const Default = meta.story({
    parameters: {
        provider: {
            user: MOCK_USER,
        },
    },
    beforeEach: () => {
        mocked(auth).mockResolvedValue(MOCK_SESSION as any);
        mocked(getUserChatPreferences).mockResolvedValue(
            MOCK_EMPTY_USER_CHAT_PREFERENCES,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedChats());
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

Default.test("should render chat sidebar items", async ({ canvas }) => {
    await waitFor(() => {
        const sidebarItems = canvas.getAllByTestId("sidebar-menu-item");
        const chatSidebarHistoryItems = canvas.getAllByTestId(
            "chat-sidebar-history-item",
        );

        expect(sidebarItems.length).toBeGreaterThan(0);
        expect(chatSidebarHistoryItems.length).toBeGreaterThan(0);

        sidebarItems.forEach(item => {
            expect(item).toBeVisible();
        });
        chatSidebarHistoryItems.forEach(item => {
            expect(item).toBeVisible();
        });
    });
});

Default.test("should render user sidebar item", async ({ canvas }) => {
    await waitFor(() => {
        const userName = canvas.getByText(MOCK_APP_USER_NAME_DISPLAY);
        expect(userName).toBeVisible();

        const userEmail = canvas.getByText(MOCK_APP_USER_EMAIL_DISPLAY);
        expect(userEmail).toBeVisible();

        const userMenuButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_APP_BUTTON_OPEN_USER_MENU, "i"),
        });
        expect(userMenuButton).toBeVisible();
    });
});

Default.test("should render user greeting", async ({ canvas }) => {
    await waitFor(() => {
        const greeting = canvas.getByText(
            new RegExp(
                `Good (morning|afternoon|evening), ${MOCK_APP_USER_NAME_DISPLAY.split(" ")[0]}!`,
            ),
        );
        expect(greeting).toBeVisible();
    });
});

Default.test("should render chat composer", async ({ canvas }) => {
    await waitForTestId(canvas, "chat-composer");
});

Default.test(
    "should collapse sidebar when clicking on the toggle sidebar button",
    async ({ canvas, userEvent }) => {
        const toggleSidebarButton = await waitForButtonByRole(
            canvas,
            new RegExp(MOCK_APP_BUTTON_TOGGLE_SIDEBAR, "i"),
        );

        await userEvent.click(toggleSidebarButton);

        await waitFor(() => {
            const sidebar = canvas.queryByTestId("sidebar");
            expect(sidebar).toHaveAttribute("data-state", "collapsed");
        });
    },
);

export const MobileView = meta.story({
    globals: {
        viewport: { value: "ipad", isRotated: false },
    },
    parameters: {
        provider: {
            user: null,
        },
    },
    beforeEach: () => {
        mocked(getUserChatPreferences).mockResolvedValue(
            MOCK_EMPTY_USER_CHAT_PREFERENCES,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedChats());
    },
    afterEach: () => {
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

MobileView.test(
    "should open sidebar when clicking on the toggle sidebar button",
    async ({ canvas, userEvent }) => {
        const toggleSidebarButton = await waitForButtonByRole(
            canvas,
            new RegExp(MOCK_APP_BUTTON_TOGGLE_SIDEBAR, "i"),
        );

        await userEvent.click(toggleSidebarButton);

        await waitFor(() => {
            const sidebar = getElementByTestId("sidebar-sheet-content");
            expect(sidebar).toBeInTheDocument();
            expect(sidebar).toHaveAttribute("data-state", "open");
        });
    },
);

MobileView.test(
    "should render chat sidebar items",
    async ({ canvas, userEvent }) => {
        const toggleSidebarButton = await waitForButtonByRole(
            canvas,
            new RegExp(MOCK_APP_BUTTON_TOGGLE_SIDEBAR, "i"),
        );

        await userEvent.click(toggleSidebarButton);

        const sheetContent = await waitForElement(
            '[data-slot="sheet-content"]',
        );
        expect(sheetContent).toBeInTheDocument();
    },
);

export const GuestUser = meta.story({
    parameters: {
        provider: {
            user: MOCK_GUEST_USER,
        },
    },
    beforeEach: () => {
        mocked(auth).mockResolvedValue(MOCK_GUEST_SESSION as any);
        mocked(getUserChatPreferences).mockResolvedValue(
            MOCK_EMPTY_USER_CHAT_PREFERENCES,
        );
        mocked(getUserChats).mockResolvedValue(createMockPaginatedChats());
    },
    afterEach: () => {
        mocked(auth).mockClear();
        mocked(getUserChatPreferences).mockClear();
        mocked(getUserChats).mockClear();
    },
});

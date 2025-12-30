import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_NEW_CHAT,
    MOCK_CHAT_BUTTON_SEARCH,
} from "#.storybook/lib/mocks/chat";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    clickLinkAndVerify,
    waitForElement,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";

import { ChatSidebarActions } from "./chat-sidebar-actions";

const meta = preview.meta({
    component: ChatSidebarActions,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <SidebarProvider>
                    <ChatSearchDialogClient>
                        <div className="w-72 bg-zinc-950 p-4">
                            <Story />
                        </div>
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
});

Default.test("should render both action buttons", async ({ canvas }) => {
    const newChatButton = canvas.getByRole("link", {
        name: new RegExp(MOCK_CHAT_BUTTON_NEW_CHAT, "i"),
    });
    const searchButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_SEARCH, "i"),
    });

    expect(newChatButton).toBeVisible();
    expect(searchButton).toBeVisible();
});

Default.test(
    "should navigate to home when clicking new chat button",
    async ({ canvas, userEvent }) => {
        const newChatButton = canvas.getByRole("link", {
            name: new RegExp(MOCK_CHAT_BUTTON_NEW_CHAT, "i"),
        });

        await clickLinkAndVerify(newChatButton, userEvent);
    },
);

Default.test(
    "should open search dialog when clicking search button",
    async ({ canvas, userEvent }) => {
        const searchButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_SEARCH, "i"),
        });
        await userEvent.click(searchButton);

        const dialog = await waitForElement('[data-slot="dialog-content"]');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("data-state", "open");
    },
);

Default.test("should be interactive", async ({ canvas, userEvent }) => {
    const newChatButton = canvas.getByRole("link", {
        name: new RegExp(MOCK_CHAT_BUTTON_NEW_CHAT, "i"),
    });
    const searchButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_SEARCH, "i"),
    });

    expect(newChatButton).toBeVisible();
    expect(searchButton).toBeVisible();
    expect(newChatButton).toBeEnabled();
    expect(searchButton).toBeEnabled();

    await userEvent.tab();
    expect(newChatButton).toHaveFocus();
    await userEvent.tab();
    expect(searchButton).toHaveFocus();

    await userEvent.hover(newChatButton);
    await userEvent.hover(searchButton);
});

Default.test(
    "should not trigger navigation when already on home page",
    async ({ userEvent }) => {
        getRouter().push.mockClear();
        const originalPathname = window.location.pathname;
        window.history.replaceState({}, "", "/");

        await userEvent.keyboard("{Control>}{Shift>}o{/Shift}{/Control}");

        await waitFor(() => {
            expect(getRouter().push).not.toHaveBeenCalled();
        });

        window.history.replaceState({}, "", originalPathname);
    },
);

Default.test(
    "should open search dialog with keyboard shortcut",
    async ({ userEvent }) => {
        await userEvent.keyboard("{Control>}k{/Control}");

        const dialog = await waitForElement('[data-slot="dialog-content"]');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("data-state", "open");
    },
);

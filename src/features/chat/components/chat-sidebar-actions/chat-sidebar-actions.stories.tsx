import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import { ChatSearchDialogClient } from "@/features/chat/components/chat-search-dialog";

import { ChatSidebarActions } from "./chat-sidebar-actions";
import { ChatSidebarActionsSkeleton } from "./chat-sidebar-actions-skeleton";

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    return (
        <QueryProvider>
            <SidebarProvider>
                <ChatSearchDialogClient>
                    <div className="w-72 bg-zinc-950 p-4">
                        <Story />
                    </div>
                </ChatSearchDialogClient>
            </SidebarProvider>
        </QueryProvider>
    );
};

const meta = preview.meta({
    component: ChatSidebarActions,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
        nextjs: {
            navigation: {
                pathname: "/chat/123",
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
});

Default.test("should render both action buttons", async ({ canvas }) => {
    const newChatButton = canvas.getByRole("link", { name: /new chat/i });
    const searchButton = canvas.getByRole("button", { name: /search/i });

    expect(newChatButton).toBeVisible();
    expect(searchButton).toBeVisible();
});

Default.test(
    "should navigate to home when clicking new chat button",
    async ({ canvas, userEvent }) => {
        const newChatButton = canvas.getByRole("link", { name: /new chat/i });

        let clickIntercepted = false;
        const clickHandler = (e: MouseEvent) => {
            e.preventDefault();
            clickIntercepted = true;
        };

        newChatButton.addEventListener("click", clickHandler, { once: true });

        await userEvent.click(newChatButton);

        expect(clickIntercepted).toBe(true);
    },
);

Default.test(
    "should open search dialog when clicking search button",
    async ({ canvas, userEvent }) => {
        const searchButton = canvas.getByRole("button", { name: /search/i });
        await userEvent.click(searchButton);

        await waitFor(() => {
            const dialog = document.querySelector(
                '[data-slot="dialog-content"]',
            );
            expect(dialog).toBeInTheDocument();
            expect(dialog).toHaveAttribute("data-state", "open");
        });
    },
);

Default.test("should be interactive", async ({ canvas, userEvent }) => {
    const newChatButton = canvas.getByRole("link", { name: /new chat/i });
    const searchButton = canvas.getByRole("button", { name: /search/i });

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

        await waitFor(() => {
            const dialog = document.querySelector(
                '[data-slot="dialog-content"]',
            );
            expect(dialog).toBeInTheDocument();
            expect(dialog).toHaveAttribute("data-state", "open");
        });
    },
);

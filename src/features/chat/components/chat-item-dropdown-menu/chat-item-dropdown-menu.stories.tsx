import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, UIChat } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";

import {
    ChatItemDropdownMenu,
    ChatItemDropdownMenuTrigger,
} from "./chat-item-dropdown-menu";

const stableDate = new Date("2025-01-01").toISOString();
const mockChatId = "00000000-0000-0000-0000-000000000001" as DBChatId;

const mockChat: UIChat = {
    id: mockChatId,
    title: "My Chat Conversation",
    visibility: CHAT_VISIBILITY.PRIVATE,
    createdAt: stableDate,
    updatedAt: stableDate,
    visibleAt: stableDate,
};

const meta = preview.meta({
    component: ChatItemDropdownMenu,
    args: {
        chat: mockChat,
        onRename: fn(),
    },
    decorators: [
        Story => (
            <QueryProvider>
                <ChatOffsetProvider>
                    <ChatCacheSyncProvider>
                        <Story />
                        <Toaster />
                    </ChatCacheSyncProvider>
                </ChatOffsetProvider>
            </QueryProvider>
        ),
    ],
    argTypes: {
        chat: {
            control: "object",
            description: "The chat object",
            table: {
                type: {
                    summary: "UIChat",
                },
            },
        },
        onRename: {
            description: "Callback fired when rename is clicked",
            table: {
                type: {
                    summary: "() => void",
                },
            },
        },
        showShare: {
            control: "boolean",
            description: "Whether to show the share option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        showDelete: {
            control: "boolean",
            description: "Whether to show the delete option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        showRename: {
            control: "boolean",
            description: "Whether to show the rename option",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        contentProps: {
            control: "object",
            description: "Props to pass to DropdownMenuContent",
            table: {
                type: {
                    summary:
                        "Omit<React.ComponentProps<typeof DropdownMenuContent>, 'children'>",
                },
            },
        },
    },
});

export const Default = meta.story({
    name: "Default",
    render: args => (
        <ChatItemDropdownMenu {...args}>
            <ChatItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
            </ChatItemDropdownMenuTrigger>
        </ChatItemDropdownMenu>
    ),
});

Default.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
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
            name: /^open menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            const items = document.querySelectorAll('[role="menuitem"]');
            return items;
        });

        expect(menuItems.length).toBeGreaterThan(0);
    },
);

Default.test(
    "should open share dialog when share is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const shareButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(
                button => button.textContent === "Share",
            );
        });
        await userEvent.click(shareButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should open delete dialog when delete is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const deleteButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(
                button => button.textContent === "Delete",
            );
        });
        await userEvent.click(deleteButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should call onRename when rename is clicked",
    async ({ canvas, userEvent, args }) => {
        const onRename = args.onRename as ReturnType<typeof fn>;
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const renameButton = await waitFor(() => {
            const buttons = document.querySelectorAll('[role="menuitem"]');
            return Array.from(buttons).find(
                button => button.textContent === "Rename",
            );
        });
        await userEvent.click(renameButton!);

        await waitFor(() => {
            expect(onRename).toHaveBeenCalledTimes(1);
        });
    },
);

export const WithoutRename = meta.story({
    name: "Without Rename",
    args: {
        showRename: false,
    },
    render: args => (
        <ChatItemDropdownMenu {...args}>
            <ChatItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
            </ChatItemDropdownMenuTrigger>
        </ChatItemDropdownMenu>
    ),
});

WithoutRename.test(
    "should not display rename option when showRename is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Rename");
        });
    },
);

export const WithoutShare = meta.story({
    name: "Without Share",
    args: {
        showShare: false,
    },
    render: args => (
        <ChatItemDropdownMenu {...args}>
            <ChatItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
            </ChatItemDropdownMenuTrigger>
        </ChatItemDropdownMenu>
    ),
});

WithoutShare.test(
    "should not display share option when showShare is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Share");
        });
    },
);

export const WithoutDelete = meta.story({
    name: "Without Delete",
    args: {
        showDelete: false,
    },
    render: args => (
        <ChatItemDropdownMenu {...args}>
            <ChatItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
            </ChatItemDropdownMenuTrigger>
        </ChatItemDropdownMenu>
    ),
});

WithoutDelete.test(
    "should not display delete option when showDelete is false",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Delete");
        });
    },
);

export const OnlyRename = meta.story({
    name: "Only Rename",
    args: {
        showShare: false,
        showDelete: false,
    },
    render: args => (
        <ChatItemDropdownMenu {...args}>
            <ChatItemDropdownMenuTrigger asChild>
                <Button variant="outline">Open Menu</Button>
            </ChatItemDropdownMenuTrigger>
        </ChatItemDropdownMenu>
    ),
});

OnlyRename.test(
    "should only display rename option when share and delete are hidden",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const menuItems = await waitFor(() => {
            return Array.from(document.querySelectorAll('[role="menuitem"]'));
        });

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Share");
            expect(item.textContent).not.toContain("Delete");
        });
    },
);

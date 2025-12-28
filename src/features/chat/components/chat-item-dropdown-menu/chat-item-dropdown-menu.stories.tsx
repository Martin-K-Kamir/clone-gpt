import { withChatProvidersAndToaster } from "#.storybook/lib/decorators/providers";
import { createMockPrivateChat } from "#.storybook/lib/mocks/chats";
import {
    waitForDialog,
    waitForDropdownMenu,
    waitForMenuItemByText,
    waitForMenuItems,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    ChatItemDropdownMenu,
    ChatItemDropdownMenuTrigger,
} from "./chat-item-dropdown-menu";

const mockChat = createMockPrivateChat(0);

const meta = preview.meta({
    component: ChatItemDropdownMenu,
    args: {
        chat: mockChat,
        onRename: fn(),
    },
    decorators: [withChatProvidersAndToaster],
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

        await waitForDropdownMenu();
    },
);

Default.test(
    "should display all menu items when all options are enabled",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /^open menu$/i,
        });
        await userEvent.click(trigger);

        const menuItems = await waitForMenuItems();

        expect(menuItems.length).toBeGreaterThan(0);
    },
);

Default.test(
    "should open share dialog when share is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const shareButton = await waitForMenuItemByText("Share");
        await userEvent.click(shareButton);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should open delete dialog when delete is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const deleteButton = await waitForMenuItemByText("Delete");
        await userEvent.click(deleteButton);

        await waitForDialog("alertdialog");
    },
);

Default.test(
    "should call onRename when rename is clicked",
    async ({ canvas, userEvent, args }) => {
        const onRename = args.onRename as ReturnType<typeof fn>;
        const trigger = canvas.getByRole("button", { name: /^open menu$/i });
        await userEvent.click(trigger);

        const renameButton = await waitForMenuItemByText("Rename");
        await userEvent.click(renameButton);

        await waitFor(() => {
            expect(onRename).toHaveBeenCalledTimes(1);
        });
    },
);

export const WithoutRename = meta.story({
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

        const menuItems = await waitForMenuItems();

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Rename");
        });
    },
);

export const WithoutShare = meta.story({
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

        const menuItems = await waitForMenuItems();

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Share");
        });
    },
);

export const WithoutDelete = meta.story({
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

        const menuItems = await waitForMenuItems();

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Delete");
        });
    },
);

export const OnlyRename = meta.story({
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

        const menuItems = await waitForMenuItems();

        menuItems.forEach(item => {
            expect(item.textContent).not.toContain("Share");
            expect(item.textContent).not.toContain("Delete");
        });
    },
);

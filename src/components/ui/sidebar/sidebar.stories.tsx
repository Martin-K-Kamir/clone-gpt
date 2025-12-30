import {
    MOCK_SIDEBAR_MENU_ITEMS,
    MOCK_SIDEBAR_RECENT_CHATS,
    MOCK_SIDEBAR_USER_NAME,
} from "#.storybook/lib/mocks/sidebar";
import { waitForElement } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { HomeIcon, InboxIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { expect } from "storybook/test";

import { Sidebar } from "./sidebar";
import { SidebarContent } from "./sidebar-content";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarGroup } from "./sidebar-group";
import { SidebarGroupContent } from "./sidebar-group-content";
import { SidebarGroupLabel } from "./sidebar-group-label";
import { SidebarHeader } from "./sidebar-header";
import { SidebarInset } from "./sidebar-inset";
import { SidebarMenu } from "./sidebar-menu";
import { SidebarMenuButton } from "./sidebar-menu-button";
import { SidebarMenuItem } from "./sidebar-menu-item";
import { SidebarProvider } from "./sidebar-provider";
import { SidebarRail } from "./sidebar-rail";
import { SidebarTrigger } from "./sidebar-trigger";
import { SidebarWrapper } from "./sidebar-wrapper";

const meta = preview.meta({
    component: Sidebar,

    parameters: {
        layout: "fullscreen",
    },
    argTypes: {
        side: {
            control: "select",
            options: ["left", "right"],
            description: "Which side of the screen the sidebar appears on",
            table: {
                type: { summary: "'left' | 'right'" },
                defaultValue: { summary: "left" },
            },
        },
        variant: {
            control: "select",
            options: ["sidebar", "floating", "inset"],
            description: "Visual style variant of the sidebar",
            table: {
                type: { summary: "'sidebar' | 'floating' | 'inset'" },
                defaultValue: { summary: "sidebar" },
            },
        },
        collapsible: {
            control: "select",
            options: ["offcanvas", "icon", "none"],
            description:
                "How the sidebar collapses. 'offcanvas' slides off-screen, 'icon' shrinks to icons, 'none' is always visible",
            table: {
                type: { summary: "'offcanvas' | 'icon' | 'none'" },
                defaultValue: { summary: "offcanvas" },
            },
        },
    },
    decorators: [
        Story => (
            <div className="h-[600px] w-full">
                <Story />
            </div>
        ),
    ],
});

export const Default = meta.story({
    render: () => (
        <SidebarProvider>
            <SidebarWrapper>
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800">
                                <span className="text-sm font-bold">A</span>
                            </div>
                            <span className="font-semibold">Acme Inc</span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Application</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {MOCK_SIDEBAR_MENU_ITEMS.map(item => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <UsersIcon />
                                    <span>Team</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-4">
                        <SidebarTrigger />
                        <span className="font-semibold">Dashboard</span>
                    </header>
                    <div className="flex-1 p-4">
                        <p className="text-zinc-400">Main content goes here</p>
                    </div>
                </SidebarInset>
            </SidebarWrapper>
        </SidebarProvider>
    ),
});

Default.test(
    "should collapse sidebar when trigger is clicked",
    async ({ userEvent, canvas }) => {
        const trigger = canvas.getByTestId("sidebar-trigger-button");

        await userEvent.click(trigger);

        const sidebarWrapper = await waitForElement('[data-slot="sidebar"]');
        expect(sidebarWrapper).toHaveAttribute("data-state", "collapsed");
    },
);

Default.test(
    "should expand sidebar when trigger is clicked again",
    async ({ userEvent, canvas }) => {
        const trigger = canvas.getByTestId("sidebar-trigger-button");

        await userEvent.click(trigger);

        let sidebarWrapper = await waitForElement('[data-slot="sidebar"]');
        expect(sidebarWrapper).toHaveAttribute("data-state", "collapsed");

        await userEvent.click(trigger);

        sidebarWrapper = await waitForElement('[data-slot="sidebar"]');
        expect(sidebarWrapper).toHaveAttribute("data-state", "expanded");
    },
);

Default.test(
    "should collapse sidebar when keyboard shortcut is pressed",
    async ({ userEvent }) => {
        await userEvent.keyboard("{Control>}b{/Control}");

        const sidebarWrapper = await waitForElement('[data-slot="sidebar"]');
        expect(sidebarWrapper).toHaveAttribute("data-state", "collapsed");
    },
);

Default.test(
    "should expand sidebar when keyboard shortcut is pressed again",
    async ({ userEvent }) => {
        await userEvent.keyboard("{Control>}b{/Control}");

        let sidebarWrapper = await waitForElement('[data-slot="sidebar"]');
        expect(sidebarWrapper).toHaveAttribute("data-state", "collapsed");

        await userEvent.keyboard("{Control>}b{/Control}");

        sidebarWrapper = await waitForElement('[data-slot="sidebar"]');
        expect(sidebarWrapper).toHaveAttribute("data-state", "expanded");
    },
);

Default.test(
    "should be interactive when menu button is clicked",
    async ({ userEvent, canvas }) => {
        const menuButton = canvas.getByRole("button", { name: "Home" });

        await userEvent.click(menuButton);
        await userEvent.hover(menuButton);
    },
);

export const VariantSidebar = meta.story({
    render: () => (
        <SidebarProvider>
            <SidebarWrapper>
                <Sidebar variant="sidebar">
                    <SidebarHeader>
                        <div className="px-2 py-1 font-semibold">
                            Sidebar Variant
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {MOCK_SIDEBAR_MENU_ITEMS.slice(0, 3).map(
                                        item => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-4">
                        <SidebarTrigger />
                        <span>Default sidebar variant with border</span>
                    </header>
                </SidebarInset>
            </SidebarWrapper>
        </SidebarProvider>
    ),
});

export const VariantInset = meta.story({
    render: () => (
        <SidebarProvider>
            <SidebarWrapper>
                <Sidebar variant="inset">
                    <SidebarHeader>
                        <div className="px-2 py-1 font-semibold">
                            Inset Variant
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {MOCK_SIDEBAR_MENU_ITEMS.slice(0, 3).map(
                                        item => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-4">
                        <SidebarTrigger />
                        <span>
                            Inset sidebar with padding and rounded content
                        </span>
                    </header>
                </SidebarInset>
            </SidebarWrapper>
        </SidebarProvider>
    ),
});

export const SideRight = meta.story({
    render: () => (
        <SidebarProvider>
            <SidebarWrapper>
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-4">
                        <span>Content on the left</span>
                        <SidebarTrigger className="ml-auto" />
                    </header>
                </SidebarInset>
                <Sidebar side="right">
                    <SidebarHeader>
                        <div className="px-2 py-1 font-semibold">
                            Right Sidebar
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Details</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {MOCK_SIDEBAR_MENU_ITEMS.slice(0, 3).map(
                                        item => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarRail />
                </Sidebar>
            </SidebarWrapper>
        </SidebarProvider>
    ),
});

export const CollapsibleOffcanvas = meta.story({
    render: () => (
        <SidebarProvider defaultOpen={false}>
            <SidebarWrapper>
                <Sidebar collapsible="offcanvas">
                    <SidebarHeader>
                        <div className="px-2 py-1 font-semibold">
                            Offcanvas Mode
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Menu</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {MOCK_SIDEBAR_MENU_ITEMS.map(item => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-4">
                        <SidebarTrigger />
                        <span>Click trigger to slide sidebar in/out</span>
                    </header>
                </SidebarInset>
            </SidebarWrapper>
        </SidebarProvider>
    ),
});

export const FullApplication = meta.story({
    render: () => (
        <SidebarProvider>
            <SidebarWrapper>
                <Sidebar collapsible="offcanvas" variant="inset">
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                                <span className="text-sm font-bold text-white">
                                    C
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold">CloneGPT</span>
                                <span className="text-xs text-zinc-400">
                                    AI Assistant
                                </span>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton isActive>
                                            <HomeIcon />
                                            <span>New Chat</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarGroupLabel>Recent</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {MOCK_SIDEBAR_RECENT_CHATS.map(title => (
                                        <SidebarMenuItem key={title}>
                                            <SidebarMenuButton>
                                                <InboxIcon />
                                                <span>{title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <SettingsIcon />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <UsersIcon />
                                    <span>{MOCK_SIDEBAR_USER_NAME}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 px-4">
                        <SidebarTrigger />
                        <span className="font-semibold">New Chat</span>
                    </header>
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
                        <h1 className="text-2xl font-bold">
                            How can I help you today?
                        </h1>
                        <p className="text-zinc-400">
                            Start a conversation with the AI assistant
                        </p>
                    </div>
                </SidebarInset>
            </SidebarWrapper>
        </SidebarProvider>
    ),
});

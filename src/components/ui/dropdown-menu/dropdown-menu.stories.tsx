import {
    getHighlightedDropdownMenuCheckboxItem,
    getHighlightedDropdownMenuItem,
    getHighlightedDropdownMenuRadioItem,
} from "#.storybook/lib/utils/elements";
import {
    waitForDropdownMenu,
    waitForDropdownMenuCheckboxItemByText,
    waitForDropdownMenuItemByText,
    waitForDropdownMenuRadioItemByText,
    waitForDropdownMenuSubContent,
    waitForDropdownMenuSubContentToClose,
    waitForDropdownMenuSubTrigger,
    waitForDropdownMenuToClose,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import {
    CopyIcon,
    DownloadIcon,
    EditIcon,
    LogOutIcon,
    MoreHorizontalIcon,
    PlusIcon,
    SettingsIcon,
    TrashIcon,
    UserIcon,
} from "lucide-react";
import { useState } from "react";
import { expect, fireEvent, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "./index";

const meta = preview.meta({
    component: DropdownMenu,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        open: {
            control: "boolean",
            description: "Whether the dropdown menu is open",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultOpen: {
            control: "boolean",
            description: "Whether the dropdown menu is open by default",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onOpenChange: {
            description: "Callback fired when the open state changes",
            table: {
                type: {
                    summary: "(open: boolean) => void",
                },
            },
        },
    },
});

export const Default = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <UserIcon />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <EditIcon />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CopyIcon />
                    Copy
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

Default.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

Default.test(
    "should open and close dropdown menu",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        await waitForDropdownMenuToClose();
    },
);

Default.test(
    "should close dropdown menu when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        fireEvent.pointerDown(document.body);

        await waitForDropdownMenuToClose();
    },
);

Default.test(
    "should close dropdown menu when pressing escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        await waitForDropdownMenuToClose();
    },
);

Default.test(
    "should navigate between items with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Settings");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Settings");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });
    },
);

Default.test(
    "should stay on first item when pressing arrow up at start",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });
    },
);

Default.test(
    "should stay on last item when pressing arrow down at end",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");

        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });
    },
);

Default.test(
    "should close dropdown menu when selecting item",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        const profileItem = await waitForDropdownMenuItemByText(/profile/i);
        expect(profileItem).toBeInTheDocument();

        await userEvent.click(profileItem);

        await waitForDropdownMenuToClose();
    },
);

Default.test("should select item on click", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /actions/i,
    });
    await userEvent.click(trigger);

    const menu = await waitForDropdownMenu();
    expect(menu).toBeInTheDocument();

    const profileItem = await waitForDropdownMenuItemByText(/profile/i);
    expect(profileItem).toBeInTheDocument();

    await userEvent.click(profileItem);

    await waitForDropdownMenuToClose();
});

Default.test(
    "should select item on enter key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{enter}");

        await waitForDropdownMenuToClose();
    },
);

export const WithSeparators = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <UserIcon />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <EditIcon />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CopyIcon />
                    Copy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

WithSeparators.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

export const WithGroups = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <CopyIcon />
                        Copy
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

WithGroups.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

export const WithShortcuts = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <UserIcon />
                    Profile
                    <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <CopyIcon />
                    Copy
                    <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <DownloadIcon />
                    Download
                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

WithShortcuts.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

export const WithSubmenus = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <UserIcon />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SettingsIcon />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <PlusIcon />
                        More Options
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>
                            <EditIcon />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CopyIcon />
                            Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <DownloadIcon />
                            Download
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

WithSubmenus.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

WithSubmenus.test(
    "should open submenu on click",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        const subTrigger = await waitForDropdownMenuSubTrigger();

        await userEvent.click(subTrigger);

        const subMenu = await waitForDropdownMenuSubContent();
        expect(subMenu).toBeInTheDocument();
    },
);

WithSubmenus.test(
    "should open submenu on hover",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        const subTrigger = await waitForDropdownMenuSubTrigger();

        await userEvent.hover(subTrigger);
        await waitForDropdownMenuSubContent();
    },
);

WithSubmenus.test(
    "should close submenu on hover out",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        const subTrigger = await waitForDropdownMenuSubTrigger();

        await userEvent.hover(subTrigger);

        await waitForDropdownMenuSubContent();

        const profileItem = await waitForDropdownMenuItemByText(/profile/i);

        await userEvent.hover(profileItem);

        await waitForDropdownMenuSubContentToClose();
    },
);

WithSubmenus.test(
    "should close when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const subTrigger = await waitForDropdownMenuSubTrigger();
        await userEvent.hover(subTrigger);

        fireEvent.pointerDown(document.body);

        await waitForDropdownMenuToClose();
        await waitForDropdownMenuSubContentToClose();
    },
);

WithSubmenus.test(
    "should close when pressing escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const subTrigger = await waitForDropdownMenuSubTrigger();

        await userEvent.hover(subTrigger);
        await userEvent.keyboard("{Escape}");

        await waitForDropdownMenuToClose();
        await waitForDropdownMenuSubContentToClose();
    },
);

WithSubmenus.test(
    "should open submenu with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowright}");

        const subMenu = await waitForDropdownMenuSubContent();
        expect(subMenu).toBeInTheDocument();
    },
);

WithSubmenus.test(
    "should close submenu with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowright}");
        await userEvent.keyboard("{arrowleft}");

        await waitForDropdownMenuSubContentToClose();
    },
);

WithSubmenus.test(
    "should navigate between items with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Settings");
        });

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowright}");

        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Download");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });
    },
);

WithSubmenus.test(
    "should stay on first item when pressing arrow up at start",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Settings");
        });

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowright}");

        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });
    },
);

WithSubmenus.test(
    "should stay on last item when pressing arrow down at end",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Settings");
        });

        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowright}");

        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Copy");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Download");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Download");
        });
    },
);

WithSubmenus.test(
    "should select item on click",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const subTrigger = await waitForDropdownMenuSubTrigger();

        await userEvent.click(subTrigger);

        const editItem = await waitForDropdownMenuItemByText(/edit/i);
        expect(editItem).toBeInTheDocument();

        await userEvent.click(editItem);

        await waitForDropdownMenuSubContentToClose();
    },
);

WithSubmenus.test(
    "should select item on enter key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowdown}");
        await userEvent.keyboard("{arrowright}");
        await userEvent.keyboard("{enter}");

        await waitForDropdownMenuSubContentToClose();
    },
);

export const WithCheckboxes = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => {
        const [showStatusBar, setShowStatusBar] = useState(true);
        const [showActivityBar, setShowActivityBar] = useState(false);
        const [showPanel, setShowPanel] = useState(false);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">View Options</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={showStatusBar}
                        onCheckedChange={setShowStatusBar}
                    >
                        Status Bar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={showActivityBar}
                        onCheckedChange={setShowActivityBar}
                    >
                        Activity Bar
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={showPanel}
                        onCheckedChange={setShowPanel}
                    >
                        Panel
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    },
});

WithCheckboxes.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /view options/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

WithCheckboxes.test(
    "should toggle checkbox items",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /view options/i,
        });
        await userEvent.click(trigger);

        const statusBarItem =
            await waitForDropdownMenuCheckboxItemByText("Status Bar");
        expect(statusBarItem).toBeChecked();

        const activityBarItem =
            await waitForDropdownMenuCheckboxItemByText("Activity Bar");
        expect(activityBarItem).not.toBeChecked();

        await userEvent.click(activityBarItem);
        expect(statusBarItem).toBeChecked();
        expect(activityBarItem).toBeChecked();

        const panelItem = await waitForDropdownMenuCheckboxItemByText("Panel");
        expect(panelItem).not.toBeChecked();
    },
);

WithCheckboxes.test(
    "should toggle checkbox items with arrow keys and enter",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /view options/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");

        const statusBarItem =
            await waitForDropdownMenuCheckboxItemByText("Status Bar");
        expect(statusBarItem).toBeChecked();

        await userEvent.keyboard("{enter}");
        expect(statusBarItem).not.toBeChecked();
    },
);

WithCheckboxes.test(
    "should navigate between checkbox items with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /view options/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuCheckboxItem();
            expect(highlighted).toHaveTextContent("Status Bar");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuCheckboxItem();
            expect(highlighted).toHaveTextContent("Activity Bar");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuCheckboxItem();
            expect(highlighted).toHaveTextContent("Panel");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuCheckboxItem();
            expect(highlighted).toHaveTextContent("Activity Bar");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuCheckboxItem();
            expect(highlighted).toHaveTextContent("Status Bar");
        });
    },
);

export const WithRadioGroups = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => {
        const [position, setPosition] = useState("bottom");

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Position</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={position}
                        onValueChange={setPosition}
                    >
                        <DropdownMenuRadioItem value="top">
                            Top
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="bottom">
                            Bottom
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="right">
                            Right
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    },
});

WithRadioGroups.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /position/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

WithRadioGroups.test(
    "should select radio items",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /position/i,
        });
        await userEvent.click(trigger);

        const topItem = await waitForDropdownMenuRadioItemByText("Top");

        await userEvent.click(topItem);

        expect(topItem).toBeChecked();

        const bottomItem = await waitForDropdownMenuRadioItemByText("Bottom");
        expect(bottomItem).not.toBeChecked();

        await userEvent.click(bottomItem);
        expect(topItem).not.toBeChecked();
        expect(bottomItem).toBeChecked();

        const rightItem = await waitForDropdownMenuRadioItemByText("Right");
        expect(rightItem).not.toBeChecked();

        await userEvent.click(rightItem);
        expect(topItem).not.toBeChecked();
        expect(bottomItem).not.toBeChecked();
        expect(rightItem).toBeChecked();
    },
);

WithRadioGroups.test(
    "should select radio items with arrow keys and enter",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /position/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");

        const topItem = await waitForDropdownMenuRadioItemByText("Top");
        expect(topItem).not.toBeChecked();

        await userEvent.keyboard("{enter}");
        expect(topItem).toBeChecked();
    },
);

WithRadioGroups.test(
    "should navigate between radio items with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /position/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuRadioItem();
            expect(highlighted).toHaveTextContent("Top");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuRadioItem();
            expect(highlighted).toHaveTextContent("Bottom");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuRadioItem();
            expect(highlighted).toHaveTextContent("Right");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuRadioItem();
            expect(highlighted).toHaveTextContent("Bottom");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuRadioItem();
            expect(highlighted).toHaveTextContent("Top");
        });
    },
);

export const DestructiveItems = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <EditIcon />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CopyIcon />
                    Copy
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                    <TrashIcon />
                    Delete
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

DestructiveItems.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /actions/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

export const ComplexExample = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => {
        const [showStatusBar, setShowStatusBar] = useState(true);
        const [showActivityBar, setShowActivityBar] = useState(false);
        const [position, setPosition] = useState("bottom");

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <UserIcon />
                            Profile
                            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <SettingsIcon />
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                            checked={showStatusBar}
                            onCheckedChange={setShowStatusBar}
                        >
                            Status Bar
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showActivityBar}
                            onCheckedChange={setShowActivityBar}
                        >
                            Activity Bar
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                            value={position}
                            onValueChange={setPosition}
                        >
                            <DropdownMenuRadioItem value="top">
                                Top
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="bottom">
                                Bottom
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="right">
                                Right
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <PlusIcon />
                            More Options
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem>
                                <EditIcon />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CopyIcon />
                                Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <DownloadIcon />
                                Download
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                        <LogOutIcon />
                        Logout
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    },
});

ComplexExample.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open menu/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

export const DisabledItems = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <UserIcon />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <SettingsIcon />
                    Settings (Disabled)
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <EditIcon />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled variant="destructive">
                    <TrashIcon />
                    Delete (Disabled)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ),
});

DisabledItems.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDropdownMenu();
    },
);

DisabledItems.test(
    "should have disabled items",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const settingsItem = await waitForDropdownMenuItemByText(
            /settings \(disabled\)/i,
        );
        expect(settingsItem).toHaveAttribute("aria-disabled", "true");

        const deleteItem =
            await waitForDropdownMenuItemByText(/delete \(disabled\)/i);
        expect(deleteItem).toHaveAttribute("aria-disabled", "true");
    },
);

DisabledItems.test(
    "should skip disabled items when navigating with arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        await waitForDropdownMenu();

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowdown}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Edit");
        });

        await userEvent.keyboard("{arrowup}");
        await waitFor(() => {
            const highlighted = getHighlightedDropdownMenuItem();
            expect(highlighted).toHaveTextContent("Profile");
        });
    },
);

DisabledItems.test(
    "should not select disabled item on enter key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const settingsItem = await waitForDropdownMenuItemByText(
            /settings \(disabled\)/i,
        );

        try {
            await userEvent.hover(settingsItem);
            await userEvent.keyboard("{enter}");
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    },
);

DisabledItems.test(
    "should not select disabled item on click",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /menu/i,
        });
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();

        const settingsItem = await waitForDropdownMenuItemByText(
            /settings \(disabled\)/i,
        );

        try {
            await userEvent.click(settingsItem);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    },
);

export const SideBottom = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-start justify-center pt-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Side: Bottom (Default)</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideBottom.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "bottom");
    },
);

export const SideTop = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-end justify-center pb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Side: Top</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideTop.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "top");
    },
);

export const SideLeft = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-center justify-end pr-48">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Side: Left</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideLeft.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "left");
    },
);

export const SideRight = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-center justify-start pl-48">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Side: Right</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideRight.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "right");
    },
);

export const AlignStart = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-start justify-center pt-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-48">
                        Align: Start
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

AlignStart.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-align", "start");
    },
);

export const AlignCenter = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-start justify-center pt-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-48">
                        Align: Center (Default)
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

AlignCenter.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-align", "center");
    },
);

export const AlignEnd = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-start justify-center pt-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-48">
                        Align: End
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

AlignEnd.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-align", "end");
    },
);

export const SideTopAlignStart = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-end justify-center pb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-48">
                        Top + Start
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideTopAlignStart.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "top");
        expect(menu).toHaveAttribute("data-align", "start");
    },
);

export const SideTopAlignEnd = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-end justify-center pb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-48">
                        Top + End
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideTopAlignEnd.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "top");
        expect(menu).toHaveAttribute("data-align", "end");
    },
);

export const SideRightAlignStart = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-center justify-start pl-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Right + Start</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideRightAlignStart.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "right");
        expect(menu).toHaveAttribute("data-align", "start");
    },
);

export const SideRightAlignEnd = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-center justify-start pl-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Right + End</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideRightAlignEnd.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "right");
        expect(menu).toHaveAttribute("data-align", "end");
    },
);

export const SideLeftAlignStart = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-center justify-end pr-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Left + Start</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left" align="start">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideLeftAlignStart.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "left");
        expect(menu).toHaveAttribute("data-align", "start");
    },
);

export const SideLeftAlignEnd = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <div className="flex h-[300px] w-full items-center justify-end pr-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Left + End</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left" align="end">
                    <DropdownMenuItem>
                        <UserIcon />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <EditIcon />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
});

SideLeftAlignEnd.test(
    "should open dropdown menu when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button");
        await userEvent.click(trigger);

        const menu = await waitForDropdownMenu();
        expect(menu).toBeInTheDocument();
        expect(menu).toHaveAttribute("data-side", "left");
        expect(menu).toHaveAttribute("data-align", "end");
    },
);

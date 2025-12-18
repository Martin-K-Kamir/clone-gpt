import preview from "#.storybook/preview";
import { useState } from "react";
import { expect, fireEvent, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { SHEET_CONTROL_MODE, SHEET_SIDE, SHEET_VIEW_STATE } from "./constants";
import { Sheet } from "./sheet";
import { SheetClose } from "./sheet-close";
import { SheetContent } from "./sheet-content";
import { SheetTrigger } from "./sheet-trigger";

const meta = preview.meta({
    component: Sheet,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    args: {
        onOpenChange: fn(),
        onViewChange: fn(),
    },
    argTypes: {
        control: {
            control: "select",
            options: ["open", "view", "both"],
            description:
                "Control mode for the sheet. 'open' uses boolean open state, 'view' uses view state ('open'/'closed'), 'both' uses both.",
            table: {
                type: {
                    summary: "'open' | 'view' | 'both'",
                },
                defaultValue: { summary: "view" },
            },
        },
        open: {
            control: "boolean",
            description: "Whether the sheet is open (controlled mode)",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultOpen: {
            control: "boolean",
            description: "Whether the sheet is open by default",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        view: {
            control: "select",
            options: ["open", "closed"],
            description: "The view state of the sheet (controlled mode)",
            table: {
                type: {
                    summary: "'open' | 'closed'",
                },
            },
        },
        defaultView: {
            control: "select",
            options: ["open", "closed"],
            description: "The default view state of the sheet",
            table: {
                type: {
                    summary: "'open' | 'closed'",
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
        onViewChange: {
            description: "Callback fired when the view state changes",
            table: {
                type: {
                    summary: "(view: 'open' | 'closed') => void",
                },
            },
        },
        onChange: {
            description:
                "Callback fired when either open or view state changes",
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
    render: args => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN} {...args}>
            <SheetTrigger>Open Sheet</SheetTrigger>
            <SheetContent>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Sheet Title</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This is a sheet component that slides in from the side.
                        Click outside or press the X button to close.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <SheetClose>Cancel</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

Default.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open sheet/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);

    const sheetContent = await waitFor(() =>
        document.querySelector('[data-slot="sheet-content"]'),
    );
    expect(sheetContent).toBeInTheDocument();
});

Default.test(
    "should open and close sheet with cancel button",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open sheet/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();

        const closeButton = await waitFor(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const button = buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("cancel"),
            );
            if (!button) {
                throw new Error("Cancel button not found");
            }
            return button;
        });
        await userEvent.click(closeButton);

        await waitFor(() => {
            const sheetContent = document.querySelector(
                '[data-slot="sheet-content"][data-state="open"]',
            );
            expect(sheetContent).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should close sheet when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open sheet/i,
        });
        await userEvent.click(trigger);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();

        const overlay = await waitFor(() => {
            const overlay = document.querySelector(
                '[data-slot="sheet-overlay"]',
            );
            if (!overlay) {
                throw new Error("Overlay not found");
            }
            return overlay;
        });
        expect(overlay).toBeInTheDocument();
        fireEvent.pointerDown(overlay);

        await waitFor(
            () => {
                const sheetContent = document.querySelector(
                    '[data-slot="sheet-content"][data-state="open"]',
                );
                expect(sheetContent).not.toBeInTheDocument();
            },
            { timeout: 1000 },
        );
    },
);

Default.test(
    "should close sheet when clicking x close button",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open sheet/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();

        const closeButton = await waitFor(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const button = buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("close"),
            );
            if (!button) {
                throw new Error("Close button not found");
            }
            return button;
        });
        await userEvent.click(closeButton);

        await waitFor(() => {
            const sheetContent = document.querySelector(
                '[data-slot="sheet-content"][data-state="open"]',
            );
            expect(sheetContent).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should call onOpenChange when sheet is opening and closing",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: /open sheet/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        expect(args.onOpenChange).toHaveBeenCalledWith(true);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();

        const closeButton = await waitFor(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const button = buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("close"),
            );
            if (!button) {
                throw new Error("Close button not found");
            }
            return button;
        });
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(args.onOpenChange).toHaveBeenCalledWith(false);
        });
    },
);

Default.test(
    "should call onViewChange when sheet is opening and closing",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("button", {
            name: /open sheet/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();
        await waitFor(() => {
            expect(args.onViewChange).toHaveBeenCalledWith(
                SHEET_VIEW_STATE.OPEN,
            );
        });

        const closeButton = await waitFor(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const button = buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("close"),
            );
            if (!button) {
                throw new Error("Close button not found");
            }
            return button;
        });
        await userEvent.click(closeButton);

        await waitFor(() => {
            const sheetContent = document.querySelector(
                '[data-slot="sheet-content"][data-state="open"]',
            );
            expect(sheetContent).not.toBeInTheDocument();
            expect(args.onViewChange).toHaveBeenCalledWith(
                SHEET_VIEW_STATE.CLOSED,
            );
        });
    },
);

export const SideRight = meta.story({
    name: "Side: Right",
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger variant="outline">Open from Right</SheetTrigger>
            <SheetContent side={SHEET_SIDE.RIGHT}>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Right Side Sheet</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This sheet slides in from the right side of the screen.
                        This is the default behavior.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <SheetClose variant="outline">Close</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

SideRight.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open from right/i,
    });

    await userEvent.click(trigger);

    const sheetContent = await waitFor(() =>
        document.querySelector('[data-slot="sheet-content"]'),
    );
    expect(sheetContent).toBeInTheDocument();
});

export const SideLeft = meta.story({
    name: "Side: Left",
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger variant="outline">Open from Left</SheetTrigger>
            <SheetContent side={SHEET_SIDE.LEFT}>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Left Side Sheet</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This sheet slides in from the left side of the screen.
                        Useful for navigation menus or sidebars.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <SheetClose variant="outline">Close</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

SideLeft.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open from left/i,
    });

    await userEvent.click(trigger);

    const sheetContent = await waitFor(() =>
        document.querySelector('[data-slot="sheet-content"]'),
    );
    expect(sheetContent).toBeInTheDocument();
});

export const SideTop = meta.story({
    name: "Side: Top",
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger variant="outline">Open from Top</SheetTrigger>
            <SheetContent side={SHEET_SIDE.TOP}>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Top Sheet</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This sheet slides in from the top of the screen. Great
                        for notifications or announcements.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <SheetClose variant="outline">Dismiss</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

SideTop.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open from top/i,
    });

    await userEvent.click(trigger);

    const sheetContent = await waitFor(() =>
        document.querySelector('[data-slot="sheet-content"]'),
    );
    expect(sheetContent).toBeInTheDocument();
});

export const SideBottom = meta.story({
    name: "Side: Bottom",
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger variant="outline">Open from Bottom</SheetTrigger>
            <SheetContent side={SHEET_SIDE.BOTTOM}>
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Bottom Sheet</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This sheet slides in from the bottom of the screen.
                        Perfect for mobile-style action sheets.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <SheetClose variant="outline">Close</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

SideBottom.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open from bottom/i,
    });

    await userEvent.click(trigger);

    const sheetContent = await waitFor(() =>
        document.querySelector('[data-slot="sheet-content"]'),
    );
    expect(sheetContent).toBeInTheDocument();
});

export const AllSides = meta.story({
    name: "All Sides Preview",
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Sheet control={SHEET_CONTROL_MODE.OPEN}>
                <SheetTrigger variant="outline">Top</SheetTrigger>
                <SheetContent side={SHEET_SIDE.TOP}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold">Top Sheet</h2>
                        <SheetClose variant="outline" className="mt-4">
                            Close
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet control={SHEET_CONTROL_MODE.OPEN}>
                <SheetTrigger variant="outline">Right</SheetTrigger>
                <SheetContent side={SHEET_SIDE.RIGHT}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold">Right Sheet</h2>
                        <SheetClose variant="outline" className="mt-4">
                            Close
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet control={SHEET_CONTROL_MODE.OPEN}>
                <SheetTrigger variant="outline">Bottom</SheetTrigger>
                <SheetContent side={SHEET_SIDE.BOTTOM}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold">Bottom Sheet</h2>
                        <SheetClose variant="outline" className="mt-4">
                            Close
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
            <Sheet control={SHEET_CONTROL_MODE.OPEN}>
                <SheetTrigger variant="outline">Left</SheetTrigger>
                <SheetContent side={SHEET_SIDE.LEFT}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold">Left Sheet</h2>
                        <SheetClose variant="outline" className="mt-4">
                            Close
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    ),
});

export const Controlled = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => {
        const [open, setOpen] = useState(false);
        return (
            <>
                <Button onClick={() => setOpen(true)}>
                    Open Controlled Sheet
                </Button>
                <Sheet
                    open
                    view={
                        open ? SHEET_VIEW_STATE.OPEN : SHEET_VIEW_STATE.CLOSED
                    }
                    onViewChange={view => {
                        setOpen(view === SHEET_VIEW_STATE.OPEN ? true : false);
                    }}
                >
                    <SheetContent>
                        <div className="space-y-4 p-6">
                            <h2 className="text-lg font-semibold">
                                Controlled Sheet
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                This sheet is controlled by external state. You
                                can programmatically open and close it.
                            </p>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Close
                                </Button>
                                <Button onClick={() => setOpen(false)}>
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </>
        );
    },
});

Controlled.test("should open", async ({ canvas, userEvent }) => {
    const openButton = await canvas.findByRole("button", {
        name: /open controlled sheet/i,
    });
    await userEvent.click(openButton);

    const sheetContent = await waitFor(() =>
        document.querySelector('[data-slot="sheet-content"]'),
    );
    expect(sheetContent).toBeInTheDocument();
});

Controlled.test(
    "should be controlled by external state",
    async ({ canvas, userEvent }) => {
        const openButton = await canvas.findByRole("button", {
            name: /open controlled sheet/i,
        });
        await userEvent.click(openButton);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();

        const closeButton = await waitFor(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const button = buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("close"),
            );
            if (!button) {
                throw new Error("Close button not found");
            }
            return button;
        });
        await userEvent.click(closeButton);

        await waitFor(() => {
            const sheetContent = document.querySelector(
                '[data-slot="sheet-content"][data-state="open"]',
            );
            expect(sheetContent).not.toBeInTheDocument();
        });
    },
);

Controlled.test(
    "should close sheet when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open controlled sheet/i,
        });
        await userEvent.click(trigger);

        const sheetContent = await waitFor(() =>
            document.querySelector('[data-slot="sheet-content"]'),
        );
        expect(sheetContent).toBeInTheDocument();

        const overlay = await waitFor(() => {
            const overlay = document.querySelector(
                '[data-slot="sheet-overlay"]',
            );
            if (!overlay) {
                throw new Error("Overlay not found");
            }
            return overlay;
        });
        expect(overlay).toBeInTheDocument();
        fireEvent.pointerDown(overlay);

        await waitFor(
            () => {
                const sheetContent = document.querySelector(
                    '[data-slot="sheet-content"][data-state="open"]',
                );
                expect(sheetContent).not.toBeInTheDocument();
            },
            { timeout: 1000 },
        );
    },
);

export const LongContent = meta.story({
    name: "Long Content",
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger variant="outline">Show Long Content</SheetTrigger>
            <SheetContent>
                <div className="flex h-full flex-col p-6">
                    <h2 className="text-lg font-semibold">
                        Terms and Conditions
                    </h2>
                    <div className="mt-4 flex-1 overflow-y-auto">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua. Ut enim ad minim veniam, quis
                            nostrud exercitation ullamco laboris nisi ut aliquip
                            ex ea commodo consequat.
                        </p>
                        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt
                            in culpa qui officia deserunt mollit anim id est
                            laborum.
                        </p>
                        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            Sed ut perspiciatis unde omnis iste natus error sit
                            voluptatem accusantium doloremque laudantium, totam
                            rem aperiam, eaque ipsa quae ab illo inventore
                            veritatis et quasi architecto beatae vitae dicta
                            sunt explicabo.
                        </p>
                        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            Nemo enim ipsam voluptatem quia voluptas sit
                            aspernatur aut odit aut fugit, sed quia consequuntur
                            magni dolores eos qui ratione voluptatem sequi
                            nesciunt.
                        </p>
                        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                            Neque porro quisquam est, qui dolorem ipsum quia
                            dolor sit amet, consectetur, adipisci velit, sed
                            quia non numquam eius modi tempora incidunt ut
                            labore et dolore magnam aliquam quaerat voluptatem.
                        </p>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4 dark:border-zinc-800">
                        <SheetClose variant="outline">Decline</SheetClose>
                        <SheetClose>Accept</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

export const FormSheet = meta.story({
    name: "Form Sheet",
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger>Open Form</SheetTrigger>
            <SheetContent>
                <div className="flex h-full flex-col p-6">
                    <h2 className="text-lg font-semibold">
                        Create New Account
                    </h2>
                    <p className="mt-2 text-sm text-zinc-200">
                        Fill in the form below to create a new account.
                    </p>
                    <div className="mt-6 flex-1 space-y-4">
                        <div className="grid gap-2">
                            <label
                                htmlFor="name"
                                className="text-sm font-medium"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4 dark:border-zinc-800">
                        <SheetClose variant="outline">Cancel</SheetClose>
                        <SheetClose>Create Account</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

export const CustomWidth = meta.story({
    name: "Custom Width",
    render: () => (
        <Sheet control={SHEET_CONTROL_MODE.OPEN}>
            <SheetTrigger variant="outline">Open Wide Sheet</SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg md:max-w-xl">
                <div className="space-y-4 p-6">
                    <h2 className="text-lg font-semibold">Wide Sheet</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        This sheet has a custom width that is wider than the
                        default. You can customize the width using Tailwind
                        classes.
                    </p>
                    <div className="flex justify-end gap-2 pt-4">
                        <SheetClose variant="outline">Close</SheetClose>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    ),
});

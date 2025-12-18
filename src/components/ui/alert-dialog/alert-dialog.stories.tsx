import preview from "#.storybook/preview";
import { useState } from "react";
import { expect, fireEvent, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./index";

const meta = preview.meta({
    component: AlertDialog,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        open: {
            control: "boolean",
            description: "Whether the dialog is open",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultOpen: {
            control: "boolean",
            description: "Whether the dialog is open by default",
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
    render: () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>Open Alert Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
});

Default.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open alert dialog/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);
});

Default.test("should open and close dialog", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open alert dialog/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);

    const dialog = await waitFor(() => {
        const element = document.querySelector('[role="alertdialog"]');
        if (!element) {
            throw new Error("Dialog not found");
        }
        return element;
    });
    expect(dialog).toBeInTheDocument();

    const title = await waitFor(() =>
        document.querySelector('[data-slot="alert-dialog-title"]'),
    );
    expect(title).toBeInTheDocument();

    const description = await waitFor(() =>
        document.querySelector('[data-slot="alert-dialog-description"]'),
    );
    expect(description).toBeInTheDocument();

    const cancelButton = await waitFor(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const button = buttons.find(btn =>
            btn.textContent?.toLowerCase().includes("cancel"),
        );
        if (!button) {
            throw new Error("Cancel button not found");
        }
        return button;
    });
    await userEvent.click(cancelButton);

    await waitFor(() => {
        const dialog = document.querySelector('[role="alertdialog"]');
        expect(dialog).not.toBeInTheDocument();
    });
});

Default.test(
    "should open and close dialog with escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open alert dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

        await userEvent.keyboard("{Escape}");

        const cancelButton = await waitFor(() => {
            const buttons = Array.from(document.querySelectorAll("button"));
            const button = buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("cancel"),
            );
            if (!button) {
                throw new Error("Cancel button not found");
            }
            return button;
        });
        await userEvent.click(cancelButton);

        await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should open and can not be closed by clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open alert dialog/i,
        });
        expect(trigger).toBeVisible();
        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );

        expect(dialog).toBeInTheDocument();
        await fireEvent.click(document.body);
        expect(dialog).toBeInTheDocument();
    },
);
export const Destructive = meta.story({
    render: () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete your account? This
                        action is permanent and cannot be undone. All your data
                        will be permanently removed.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive">
                        Delete Account
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
});

Destructive.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /delete account/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);
});

export const Simple = meta.story({
    render: () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Show Simple Alert</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Simple Alert</AlertDialogTitle>
                    <AlertDialogDescription>
                        This is a simple alert dialog with minimal content.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
});

Simple.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /show simple alert/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);
});

export const LongContent = meta.story({
    render: () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline">Show Long Content</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
                    <AlertDialogDescription className="max-h-60 overflow-y-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu
                        fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit
                        anim id est laborum. Sed ut perspiciatis unde omnis iste
                        natus error sit voluptatem accusantium doloremque
                        laudantium, totam rem aperiam, eaque ipsa quae ab illo
                        inventore veritatis et quasi architecto beatae vitae
                        dicta sunt explicabo.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Decline</AlertDialogCancel>
                    <AlertDialogAction>Accept</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
});

LongContent.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /show long content/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);
});

export const Controlled = meta.story({
    render: () => {
        const [open, setOpen] = useState(false);
        const onOpenChange = fn((newOpen: boolean) => {
            setOpen(newOpen);
        });

        return (
            <>
                <Button onClick={() => setOpen(true)}>
                    Open Controlled Dialog
                </Button>
                <AlertDialog open={open} onOpenChange={onOpenChange}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Controlled Dialog
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This dialog is controlled by external state. You
                                can programmatically open and close it.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    },
});

Controlled.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /open controlled dialog/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);
});

Controlled.test(
    "should be controlled by external state",
    async ({ canvas, userEvent }) => {
        const openButton = await canvas.findByRole("button", {
            name: /open controlled dialog/i,
        });
        await userEvent.click(openButton);

        const dialog = await waitFor(() =>
            document.querySelector('[role="alertdialog"]'),
        );
        expect(dialog).toBeInTheDocument();

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
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).not.toBeInTheDocument();
        });
    },
);

export const NoCancelButton = meta.story({
    render: () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="secondary">Show Alert</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Information</AlertDialogTitle>
                    <AlertDialogDescription>
                        This alert dialog only has an action button. You must
                        click it to close the dialog.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction>Got it</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
});

NoCancelButton.test("should open", async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", {
        name: /show alert/i,
    });
    expect(trigger).toBeVisible();

    await userEvent.click(trigger);
});

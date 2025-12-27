import {
    findButtonByText,
    waitForDialog,
    waitForDialogCloseButton,
    waitForDialogOverlay,
    waitForDialogTitle,
    waitForDialogToClose,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Dialogs,
} from "./index";

const meta = preview.meta({
    component: Dialog,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        dialogId: {
            control: "text",
            description:
                "Unique identifier for the dialog. When multiple dialogs are wrapped in a Dialogs component, each dialog needs a unique dialogId. The DialogTrigger component uses the same dialogId to open the corresponding dialog. This allows managing multiple dialogs in a single Dialogs context.",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
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
        <Dialog>
            <DialogTrigger asChild>
                <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");
    },
);

Default.test(
    "should close dialog with escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");

        await userEvent.keyboard("{Escape}");
        await waitForDialogToClose("dialog");
    },
);

Default.test(
    "should close dialog when clicking overlay",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open dialog/i,
        });
        expect(trigger).toBeVisible();
        await userEvent.click(trigger);

        await waitForDialog("dialog");
        const overlay = await waitForDialogOverlay();
        expect(overlay).toBeInTheDocument();
        await userEvent.click(overlay);

        await waitForDialogToClose("dialog");
    },
);

Default.test(
    "should close dialog with close button",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open dialog/i,
        });
        expect(trigger).toBeVisible();
        await userEvent.click(trigger);

        await waitForDialog("dialog");
        const closeButton = await waitForDialogCloseButton();
        await userEvent.click(closeButton);

        await waitForDialogToClose("dialog");
    },
);

export const Simple = meta.story({
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Show Simple Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Simple Dialog</DialogTitle>
                    <DialogDescription>
                        This is a simple dialog with minimal content.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
});

Simple.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /show simple dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");
    },
);
export const LongContent = meta.story({
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Show Long Content</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Terms and Conditions</DialogTitle>
                    <DialogDescription className="max-h-60 overflow-y-auto">
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
                        dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                        voluptas sit aspernatur aut odit aut fugit, sed quia
                        consequuntur magni dolores eos qui ratione voluptatem
                        sequi nesciunt.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Decline</Button>
                    <Button>Accept</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
});

LongContent.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /show long content/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");
    },
);

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
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Controlled Dialog</DialogTitle>
                            <DialogDescription>
                                This dialog is controlled by external state. You
                                can programmatically open and close it.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </Button>
                            <Button onClick={() => setOpen(false)}>
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    },
});

Controlled.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open controlled dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");
    },
);

Controlled.test(
    "should be controlled by external state",
    async ({ canvas, userEvent }) => {
        const openButton = canvas.getByRole("button", {
            name: /open controlled dialog/i,
        });
        await userEvent.click(openButton);

        await waitForDialog("dialog");

        const closeButton = findButtonByText(/close/i);
        await userEvent.click(closeButton);

        await waitForDialogToClose("dialog");
    },
);

export const WithoutCloseButton = meta.story({
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">Show Dialog</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Information</DialogTitle>
                    <DialogDescription>
                        This dialog doesn&apos;t have a close button in the
                        top-right corner. You can still close it by clicking
                        outside or pressing Escape.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button>Got it</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
});

WithoutCloseButton.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /show dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");
    },
);

export const FormDialog = meta.story({
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Open Form Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>
                        Fill in the form below to create a new account.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Account</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
});

FormDialog.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open form dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");
    },
);

export const MultipleDialogsWithId = meta.story({
    render: () => (
        <Dialogs>
            <div className="flex gap-4">
                <DialogTrigger asChild dialogId="first-dialog">
                    <Button variant="outline">Open First Dialog</Button>
                </DialogTrigger>
                <DialogTrigger asChild dialogId="second-dialog">
                    <Button variant="outline">Open Second Dialog</Button>
                </DialogTrigger>
                <DialogTrigger asChild dialogId="third-dialog">
                    <Button variant="outline">Open Third Dialog</Button>
                </DialogTrigger>
            </div>

            <Dialog dialogId="first-dialog">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>First Dialog</DialogTitle>
                        <DialogDescription>
                            This is the first dialog managed by dialogId. Each
                            dialog in a Dialogs context needs a unique dialogId.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog dialogId="second-dialog">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Second Dialog</DialogTitle>
                        <DialogDescription>
                            This is the second dialog with a different dialogId.
                            The DialogTrigger uses the same dialogId to open
                            this specific dialog.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog dialogId="third-dialog">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Third Dialog</DialogTitle>
                        <DialogDescription>
                            This is the third dialog. When multiple dialogs are
                            wrapped in a Dialogs component, each needs a unique
                            dialogId to be properly managed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialogs>
    ),
});

MultipleDialogsWithId.test(
    "should open first dialog with its trigger",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open first dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");

        const title = await waitForDialogTitle();
        expect(title).toHaveTextContent("First Dialog");
    },
);

MultipleDialogsWithId.test(
    "should open second dialog with its trigger",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open second dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");

        const title = await waitForDialogTitle();
        expect(title).toHaveTextContent("Second Dialog");
    },
);

MultipleDialogsWithId.test(
    "should open third dialog with its trigger",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open third dialog/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);
        await waitForDialog("dialog");

        const title = await waitForDialogTitle();
        expect(title).toHaveTextContent("Third Dialog");
    },
);

MultipleDialogsWithId.test(
    "should close dialog with escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open second dialog/i,
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");
        await userEvent.keyboard("{Escape}");
        await waitForDialogToClose("dialog");
    },
);

MultipleDialogsWithId.test(
    "should close dialog when clicking overlay",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open third dialog/i,
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");
        const overlay = await waitForDialogOverlay();
        expect(overlay).toBeInTheDocument();
        await userEvent.click(overlay);

        await waitForDialogToClose("dialog");
    },
);

MultipleDialogsWithId.test(
    "should open correct dialog when switching between triggers",
    async ({ canvas, userEvent }) => {
        const firstTrigger = canvas.getByRole("button", {
            name: /open first dialog/i,
        });
        await userEvent.click(firstTrigger);

        await waitForDialog("dialog");
        let title = await waitForDialogTitle();
        expect(title).toHaveTextContent("First Dialog");

        await userEvent.keyboard("{Escape}");
        await waitForDialogToClose("dialog");

        const secondTrigger = canvas.getByRole("button", {
            name: /open second dialog/i,
        });
        await userEvent.click(secondTrigger);

        await waitForDialog("dialog");
        title = await waitForDialogTitle();
        expect(title).toHaveTextContent("Second Dialog");
    },
);

MultipleDialogsWithId.test(
    "should be able to open and close dialogs with different ids",
    async ({ canvas, userEvent }) => {
        const dialogs = [
            { name: /open first dialog/i, title: "First Dialog" },
            { name: /open second dialog/i, title: "Second Dialog" },
            { name: /open third dialog/i, title: "Third Dialog" },
        ];

        for (const { name, title } of dialogs) {
            const trigger = canvas.getByRole("button", { name });
            expect(trigger).toBeVisible();
            await userEvent.click(trigger);

            await waitForDialog("dialog");
            const dialogTitle = await waitForDialogTitle();
            expect(dialogTitle).toHaveTextContent(title);

            const closeButton = await waitForDialogCloseButton();
            await userEvent.click(closeButton);

            await waitForDialogToClose("dialog");
        }
    },
);

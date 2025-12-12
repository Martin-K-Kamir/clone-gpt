import preview from "#.storybook/preview";
import { toast } from "sonner";
import { expect, fireEvent, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { Toaster } from "./sonner";

const meta = preview.meta({
    component: Toaster,
    tags: ["autodocs"],
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        theme: {
            control: "select",
            description: "The theme of the toaster",
            options: ["light", "dark", "system"],
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "system",
                },
            },
        },
        position: {
            control: "select",
            description: "The position of the toaster",
            options: [
                "top-left",
                "top-center",
                "top-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
            ],
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "bottom-right",
                },
            },
        },
        richColors: {
            control: "boolean",
            description: "Whether to use rich colors for toast types",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        expand: {
            control: "boolean",
            description: "Whether toasts should be expanded by default",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        duration: {
            control: "number",
            description: "Default duration for toasts in milliseconds",
            table: {
                type: {
                    summary: "number",
                },
                defaultValue: {
                    summary: "4000",
                },
            },
        },
        closeButton: {
            control: "boolean",
            description: "Whether to show a close button on toasts",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
    },
});

export const Default = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast("This is a default toast message");
                }}
            >
                Show Toast
            </Button>
            <Toaster />
        </>
    ),
});

Default.test(
    "should show toast when button is clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /show toast/i });

        await userEvent.click(button);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

Default.test(
    "should show multiple toasts when button is clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /show toast/i });

        await userEvent.click(button);
        await userEvent.click(button);
        await userEvent.click(button);

        await waitFor(() => {
            const toasts = document.querySelectorAll("[data-sonner-toast]");
            expect(toasts.length).toBe(3);
        });
    },
);

Default.test(
    "should expand toasts when hovered",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /show toast/i });

        await userEvent.click(button);
        await userEvent.click(button);
        await userEvent.click(button);

        const toastElement = await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            if (!toast) {
                // @ts-expect-error - This is a test
                throw new Error("Toast not found");
            }
            return toast;
        });
        expect(toastElement).toBeInTheDocument();

        await userEvent.hover(toastElement);
        expect(toastElement).toHaveAttribute("data-expanded", "true");
    },
);

export const SwipeDismiss = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
        chromatic: { disableSnapshot: true },
    },
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast("This is a swipe dismiss toast message");
                }}
            >
                Show Toast
            </Button>
            <Toaster />
        </>
    ),
});

SwipeDismiss.test(
    "should dismiss toast when swiped right",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /show toast/i });

        await userEvent.click(button);

        const toastElement = await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            if (!toast) {
                // @ts-expect-error - This is a test
                throw new Error("Toast not found");
            }
            return toast;
        });
        expect(toastElement).toBeInTheDocument();

        // Get toast position for swipe gesture
        const rect = toastElement.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        const swipeDistance = 200;

        // Simulate swipe using PointerEvents (what Sonner listens for)
        fireEvent.pointerDown(toastElement, {
            clientX: startX,
            clientY: startY,
            pointerId: 1,
            pointerType: "mouse",
        });

        // Move in steps to simulate drag
        for (let i = 1; i <= 10; i++) {
            fireEvent.pointerMove(toastElement, {
                clientX: startX + (swipeDistance * i) / 10,
                clientY: startY,
                pointerId: 1,
                pointerType: "mouse",
            });
        }

        fireEvent.pointerUp(toastElement, {
            clientX: startX + swipeDistance,
            clientY: startY,
            pointerId: 1,
            pointerType: "mouse",
        });

        // Toast should be dismissed after swipe
        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).not.toBeInTheDocument();
        });
    },
);

SwipeDismiss.test(
    "should dismiss multiple toasts by hovering and swiping each one",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /show toast/i });

        // Create 3 toasts
        await userEvent.click(button);
        await userEvent.click(button);
        await userEvent.click(button);

        // Wait for all toasts to appear
        await waitFor(() => {
            const toasts = document.querySelectorAll("[data-sonner-toast]");
            expect(toasts.length).toBe(3);
        });

        // Helper function to swipe dismiss a toast
        const swipeDismissToast = async (toast: Element) => {
            const rect = toast.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            const swipeDistance = 200;

            fireEvent.pointerDown(toast, {
                clientX: startX,
                clientY: startY,
                pointerId: 1,
                pointerType: "mouse",
            });

            for (let i = 1; i <= 10; i++) {
                fireEvent.pointerMove(toast, {
                    clientX: startX + (swipeDistance * i) / 10,
                    clientY: startY,
                    pointerId: 1,
                    pointerType: "mouse",
                });
            }

            fireEvent.pointerUp(toast, {
                clientX: startX + swipeDistance,
                clientY: startY,
                pointerId: 1,
                pointerType: "mouse",
            });
        };

        // Dismiss each toast one by one
        for (let expectedCount = 3; expectedCount > 0; expectedCount--) {
            const toasts = document.querySelectorAll("[data-sonner-toast]");
            expect(toasts.length).toBe(expectedCount);

            const frontToast = toasts[0];

            // Hover to expand toasts
            await userEvent.hover(frontToast);
            expect(frontToast).toHaveAttribute("data-expanded", "true");

            // Swipe to dismiss
            await swipeDismissToast(frontToast);

            // Wait for toast to be dismissed
            await waitFor(() => {
                const remainingToasts = document.querySelectorAll(
                    "[data-sonner-toast]",
                );
                expect(remainingToasts.length).toBe(expectedCount - 1);
            });
        }

        // All toasts should be dismissed
        const finalToasts = document.querySelectorAll("[data-sonner-toast]");
        expect(finalToasts.length).toBe(0);
    },
);

export const Success = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast.success("Operation completed successfully!");
                }}
            >
                Show Success Toast
            </Button>
            <Toaster />
        </>
    ),
});

Success.test("should show success toast", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: /show success toast/i });

    await userEvent.click(button);

    await waitFor(() => {
        const toastElement = document.querySelector("[data-sonner-toast]");
        expect(toastElement).toBeInTheDocument();
    });
});

export const Error = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast.error("Something went wrong!");
                }}
            >
                Show Error Toast
            </Button>
            <Toaster />
        </>
    ),
});

Error.test("should show error toast", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: /show error toast/i });

    await userEvent.click(button);

    await waitFor(() => {
        const toastElement = document.querySelector("[data-sonner-toast]");
        expect(toastElement).toBeInTheDocument();
    });
});

export const Warning = meta.story({
    render: () => (
        <>
            <Button
                variant="outline"
                onClick={() => {
                    toast.warning("Please review before continuing");
                }}
            >
                Show Warning Toast
            </Button>
            <Toaster />
        </>
    ),
});

Warning.test("should show warning toast", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: /show warning toast/i });

    await userEvent.click(button);

    await waitFor(() => {
        const toastElement = document.querySelector("[data-sonner-toast]");
        expect(toastElement).toBeInTheDocument();
    });
});

export const Info = meta.story({
    render: () => (
        <>
            <Button
                variant="secondary"
                onClick={() => {
                    toast.info("Here is some useful information");
                }}
            >
                Show Info Toast
            </Button>
            <Toaster />
        </>
    ),
});

Info.test("should show info toast", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: /show info toast/i });

    await userEvent.click(button);

    await waitFor(() => {
        const toastElement = document.querySelector("[data-sonner-toast]");
        expect(toastElement).toBeInTheDocument();
    });
});

export const WithDescription = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast("Event has been created", {
                        description: "Monday, January 3rd at 6:00pm",
                    });
                }}
            >
                Show Toast with Description
            </Button>
            <Toaster />
        </>
    ),
});

WithDescription.test(
    "should show toast with description",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show toast with description/i,
        });

        await userEvent.click(button);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
            expect(toastElement?.textContent).toContain(
                "Event has been created",
            );
            expect(toastElement?.textContent).toContain(
                "Monday, January 3rd at 6:00pm",
            );
        });
    },
);

export const WithAction = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast("File deleted", {
                        action: {
                            label: "Undo",
                            onClick: () => toast.success("File restored!"),
                        },
                    });
                }}
            >
                Show Toast with Action
            </Button>
            <Toaster />
        </>
    ),
});

WithAction.test(
    "should show toast with action button",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show toast with action/i,
        });

        await userEvent.click(button);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();

            const actionButton = toastElement?.querySelector("button");
            expect(actionButton).toBeInTheDocument();
            expect(actionButton?.textContent).toContain("Undo");
        });
    },
);

WithAction.test(
    "should execute action when clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show toast with action/i,
        });
        await userEvent.click(button);

        const actionButton = await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            const btn = toastElement?.querySelector("button");
            if (!btn) {
                // @ts-expect-error - This is a test
                throw new Error("Action button not found");
            }
            return btn;
        });

        await userEvent.click(actionButton);

        await waitFor(() => {
            const successToast = document.querySelector(
                '[data-sonner-toast][data-type="success"]',
            );
            expect(successToast).toBeInTheDocument();
        });
    },
);

export const WithCloseButton = meta.story({
    decorators: [
        Story => (
            <>
                <Story />
                <Toaster closeButton />
            </>
        ),
    ],
    render: () => (
        <Button
            onClick={() => {
                toast("This toast has a close button", {
                    duration: Infinity,
                });
            }}
        >
            Show Toast with Close Button
        </Button>
    ),
});

WithCloseButton.test(
    "should show close button on toast",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show toast with close button/i,
        });

        await userEvent.click(button);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();

            const closeButton = toastElement?.querySelector(
                '[data-close-button="true"]',
            );
            expect(closeButton).toBeInTheDocument();
        });
    },
);

WithCloseButton.test(
    "should close toast when close button is clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show toast with close button/i,
        });

        await userEvent.click(button);

        const closeButton = canvas.getByLabelText("Close toast");
        await userEvent.click(closeButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).not.toBeInTheDocument();
        });
    },
);

export const CustomDuration = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast("This toast will last 10 seconds", {
                        duration: 10000,
                    });
                }}
            >
                Show Long Duration Toast
            </Button>
            <Toaster />
        </>
    ),
});

CustomDuration.test(
    "should show toast with custom duration",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show long duration toast/i,
        });

        await userEvent.click(button);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

export const AutoDismiss = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast("This toast auto-dismisses in 1.5 seconds", {
                        duration: 1500,
                    });
                }}
            >
                Show Auto-Dismiss Toast
            </Button>
            <Toaster />
        </>
    ),
});

AutoDismiss.test(
    "should auto-dismiss after duration",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show auto-dismiss toast/i,
        });

        await userEvent.click(button);

        const toastElement = await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            if (!toast) {
                // @ts-expect-error - This is a test
                throw new Error("Toast not found");
            }
            return toast;
        });
        expect(toastElement).toBeInTheDocument();

        await waitFor(
            () => {
                const toast = document.querySelector("[data-sonner-toast]");
                expect(toast).not.toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    },
);

AutoDismiss.test(
    "should pause dismiss timer while hovered and dismiss after unhover",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show auto-dismiss toast/i,
        });

        await userEvent.click(button);

        const toastElement = await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            if (!toast) {
                // @ts-expect-error - This is a test
                throw new Error("Toast not found");
            }
            return toast;
        });
        expect(toastElement).toBeInTheDocument();

        await userEvent.hover(toastElement);

        await new Promise(resolve => setTimeout(resolve, 2000));

        expect(
            document.querySelector("[data-sonner-toast]"),
        ).toBeInTheDocument();

        await userEvent.unhover(toastElement);

        await waitFor(
            () => {
                const toast = document.querySelector("[data-sonner-toast]");
                expect(toast).not.toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    },
);

export const PromiseToast = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    const promise = new Promise<{ name: string }>(
                        (resolve: (value: { name: string }) => void) => {
                            setTimeout(
                                () => resolve({ name: "My File.txt" }),
                                2000,
                            );
                        },
                    );

                    toast.promise(promise, {
                        loading: "Uploading file...",
                        success: (data: { name: string }) =>
                            `${data.name} has been uploaded`,
                        error: "Upload failed",
                    });
                }}
            >
                Upload File
            </Button>
            <Toaster />
        </>
    ),
});

PromiseToast.test(
    "should show loading state then success",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /upload file/i });

        await userEvent.click(button);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
            expect(toastElement).toHaveAttribute("data-type", "loading");
        });

        await waitFor(
            () => {
                const toastElement = document.querySelector(
                    '[data-sonner-toast][data-type="success"]',
                );
                expect(toastElement).toBeInTheDocument();
            },
            { timeout: 3000 },
        );
    },
);

export const RichColors = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    decorators: [
        Story => (
            <>
                <Story />
                <Toaster richColors />
            </>
        ),
    ],
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Success message")}>
                Success
            </Button>
            <Button onClick={() => toast.error("Error message")}>Error</Button>
            <Button
                variant="outline"
                onClick={() => toast.warning("Warning message")}
            >
                Warning
            </Button>
            <Button
                variant="secondary"
                onClick={() => toast.info("Info message")}
            >
                Info
            </Button>
        </div>
    ),
});

RichColors.test(
    "should display success toast",
    async ({ canvas, userEvent }) => {
        const successButton = canvas.getByRole("button", {
            name: /^success$/i,
        });
        await userEvent.click(successButton);

        await waitFor(() => {
            const toastElement = document.querySelector(
                '[data-sonner-toast][data-type="success"]',
            );
            expect(toastElement).toBeInTheDocument();
        });
    },
);

RichColors.test("should display error toast", async ({ canvas, userEvent }) => {
    const errorButton = canvas.getByRole("button", {
        name: /^error$/i,
    });
    await userEvent.click(errorButton);

    await waitFor(() => {
        const toastElement = document.querySelector(
            '[data-sonner-toast][data-type="error"]',
        );
        expect(toastElement).toBeInTheDocument();
    });
});

RichColors.test(
    "should display warning toast",
    async ({ canvas, userEvent }) => {
        const warningButton = canvas.getByRole("button", {
            name: /^warning$/i,
        });
        await userEvent.click(warningButton);

        await waitFor(() => {
            const toastElement = document.querySelector(
                '[data-sonner-toast][data-type="warning"]',
            );
            expect(toastElement).toBeInTheDocument();
        });
    },
);

RichColors.test("should display info toast", async ({ canvas, userEvent }) => {
    const infoButton = canvas.getByRole("button", {
        name: /^info$/i,
    });
    await userEvent.click(infoButton);

    await waitFor(() => {
        const toastElement = document.querySelector(
            '[data-sonner-toast][data-type="info"]',
        );
        expect(toastElement).toBeInTheDocument();
    });
});

export const Positions = meta.story({
    render: () => (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            toast("Top Left Toast", { position: "top-left" });
                        }}
                    >
                        Top Left
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            toast("Top Center Toast", {
                                position: "top-center",
                            });
                        }}
                    >
                        Top Center
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            toast("Top Right Toast", { position: "top-right" });
                        }}
                    >
                        Top Right
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            toast("Bottom Left Toast", {
                                position: "bottom-left",
                            });
                        }}
                    >
                        Bottom Left
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            toast("Bottom Center Toast", {
                                position: "bottom-center",
                            });
                        }}
                    >
                        Bottom Center
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            toast("Bottom Right Toast", {
                                position: "bottom-right",
                            });
                        }}
                    >
                        Bottom Right
                    </Button>
                </div>
            </div>
            <Toaster />
        </>
    ),
});

Positions.test(
    "should show toast in top left position",
    async ({ canvas, userEvent }) => {
        const topLeftButton = canvas.getByRole("button", { name: /top left/i });
        await userEvent.click(topLeftButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

Positions.test(
    "should show toast in top center position",
    async ({ canvas, userEvent }) => {
        const topCenterButton = canvas.getByRole("button", {
            name: /top center/i,
        });
        await userEvent.click(topCenterButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

Positions.test(
    "should show toast in top right position",
    async ({ canvas, userEvent }) => {
        const topRightButton = canvas.getByRole("button", {
            name: /top right/i,
        });
        await userEvent.click(topRightButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

Positions.test(
    "should show toast in bottom left position",
    async ({ canvas, userEvent }) => {
        const bottomLeftButton = canvas.getByRole("button", {
            name: /bottom left/i,
        });
        await userEvent.click(bottomLeftButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

Positions.test(
    "should show toast in bottom center position",
    async ({ canvas, userEvent }) => {
        const bottomCenterButton = canvas.getByRole("button", {
            name: /bottom center/i,
        });
        await userEvent.click(bottomCenterButton);
        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

Positions.test(
    "should show toast in bottom right position",
    async ({ canvas, userEvent }) => {
        const bottomRightButton = canvas.getByRole("button", {
            name: /bottom right/i,
        });
        await userEvent.click(bottomRightButton);
        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });
    },
);

export const DismissToast = meta.story({
    render: () => {
        let toastId: string | number;

        return (
            <>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            toastId = toast("Persistent toast", {
                                duration: Infinity,
                            });
                        }}
                    >
                        Show Toast
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            toast.dismiss(toastId);
                        }}
                    >
                        Dismiss Toast
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            toast.dismiss();
                        }}
                    >
                        Dismiss All
                    </Button>
                </div>
                <Toaster />
            </>
        );
    },
});

DismissToast.test(
    "should dismiss toast programmatically",
    async ({ canvas, userEvent }) => {
        const showButton = canvas.getByRole("button", { name: /show toast/i });
        await userEvent.click(showButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).toBeInTheDocument();
        });

        const dismissButton = canvas.getByRole("button", {
            name: /dismiss toast/i,
        });
        await userEvent.click(dismissButton);

        await waitFor(() => {
            const toastElement = document.querySelector("[data-sonner-toast]");
            expect(toastElement).not.toBeInTheDocument();
        });
    },
);

DismissToast.test(
    "should dismiss all toasts",
    async ({ canvas, userEvent }) => {
        const showButton = canvas.getByRole("button", { name: /show toast/i });

        await userEvent.click(showButton);
        await userEvent.click(showButton);
        await userEvent.click(showButton);

        await waitFor(() => {
            const toasts = document.querySelectorAll("[data-sonner-toast]");
            expect(toasts.length).toBeGreaterThanOrEqual(1);
        });

        const dismissAllButton = canvas.getByRole("button", {
            name: /dismiss all/i,
        });
        await userEvent.click(dismissAllButton);

        await waitFor(() => {
            const toasts = document.querySelectorAll("[data-sonner-toast]");
            expect(toasts.length).toBe(0);
        });
    },
);

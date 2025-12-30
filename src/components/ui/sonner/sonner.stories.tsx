import {
    MOCK_SONNER_ACTION_LABEL,
    MOCK_SONNER_ACTION_SUCCESS_MESSAGE,
    MOCK_SONNER_CUSTOM_CONTENT_MESSAGE,
    MOCK_SONNER_CUSTOM_STYLING_MESSAGE,
    MOCK_SONNER_DESCRIPTION_WITH_DESCRIPTION,
    MOCK_SONNER_MESSAGE_AUTO_DISMISS,
    MOCK_SONNER_MESSAGE_DEFAULT,
    MOCK_SONNER_MESSAGE_ERROR,
    MOCK_SONNER_MESSAGE_INFO,
    MOCK_SONNER_MESSAGE_LONG_DURATION,
    MOCK_SONNER_MESSAGE_PERSISTENT,
    MOCK_SONNER_MESSAGE_SUCCESS,
    MOCK_SONNER_MESSAGE_SWIPE_DISMISS,
    MOCK_SONNER_MESSAGE_WARNING,
    MOCK_SONNER_MESSAGE_WITH_ACTION,
    MOCK_SONNER_MESSAGE_WITH_CLOSE_BUTTON,
    MOCK_SONNER_TITLE_WITH_DESCRIPTION,
    MOCK_SONNER_UPLOAD_ERROR,
    MOCK_SONNER_UPLOAD_LOADING,
    MOCK_SONNER_UPLOAD_SUCCESS,
} from "#.storybook/lib/mocks/sonner";
import {
    getAllSonnerToasts,
    getSonnerToast,
    getSonnerToastByType,
} from "#.storybook/lib/utils/elements";
import {
    swipeDismissElement,
    waitForSonnerToast,
    waitForSonnerToastByType,
    waitForSonnerToastToDisappear,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { toast } from "sonner";
import { expect, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { Toaster } from "./sonner";

const meta = preview.meta({
    component: Toaster,
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
                    toast(MOCK_SONNER_MESSAGE_DEFAULT);
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

        await waitForSonnerToast();
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
            const toasts = getAllSonnerToasts();
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

        const toastElement = await waitForSonnerToast();
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
                    toast(MOCK_SONNER_MESSAGE_SWIPE_DISMISS);
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

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();

        // Swipe dismiss the toast
        await swipeDismissElement(toastElement, { direction: "right" });

        // Toast should be dismissed after swipe
        await waitForSonnerToastToDisappear();
    },
);

SwipeDismiss.test(
    "should dismiss multiple toasts by hovering and swiping each one",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", { name: /show toast/i });

        await userEvent.click(button);
        await userEvent.click(button);
        await userEvent.click(button);

        await waitFor(() => {
            const toasts = getAllSonnerToasts();
            expect(toasts.length).toBe(3);
        });

        // Dismiss each toast one by one
        for (let expectedCount = 3; expectedCount > 0; expectedCount--) {
            const toasts = getAllSonnerToasts();
            expect(toasts.length).toBe(expectedCount);

            const frontToast = toasts[0];

            await userEvent.hover(frontToast);
            expect(frontToast).toHaveAttribute("data-expanded", "true");

            // Swipe to dismiss
            await swipeDismissElement(frontToast, { direction: "right" });

            await waitFor(() => {
                const remainingToasts = getAllSonnerToasts();
                expect(remainingToasts.length).toBe(expectedCount - 1);
            });
        }

        const finalToasts = getAllSonnerToasts();
        expect(finalToasts.length).toBe(0);
    },
);

export const Success = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast.success(MOCK_SONNER_MESSAGE_SUCCESS);
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
        const toastElement = getSonnerToast();
        expect(toastElement).toBeInTheDocument();
    });
});

export const Error = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast.error(MOCK_SONNER_MESSAGE_ERROR);
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
        const toastElement = getSonnerToast();
        expect(toastElement).toBeInTheDocument();
    });
});

export const Warning = meta.story({
    render: () => (
        <>
            <Button
                variant="outline"
                onClick={() => {
                    toast.warning(MOCK_SONNER_MESSAGE_WARNING);
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
        const toastElement = getSonnerToast();
        expect(toastElement).toBeInTheDocument();
    });
});

export const Info = meta.story({
    render: () => (
        <>
            <Button
                variant="secondary"
                onClick={() => {
                    toast.info(MOCK_SONNER_MESSAGE_INFO);
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
        const toastElement = getSonnerToast();
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
                    toast(MOCK_SONNER_TITLE_WITH_DESCRIPTION, {
                        description: MOCK_SONNER_DESCRIPTION_WITH_DESCRIPTION,
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

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();
        expect(toastElement.textContent).toContain(
            MOCK_SONNER_TITLE_WITH_DESCRIPTION,
        );
        expect(toastElement.textContent).toContain(
            MOCK_SONNER_DESCRIPTION_WITH_DESCRIPTION,
        );
    },
);

export const WithAction = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast(MOCK_SONNER_MESSAGE_WITH_ACTION, {
                        action: {
                            label: MOCK_SONNER_ACTION_LABEL,
                            onClick: () =>
                                toast.success(
                                    MOCK_SONNER_ACTION_SUCCESS_MESSAGE,
                                ),
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

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();

        const actionButton = toastElement.querySelector("button");
        expect(actionButton).toBeInTheDocument();
        expect(actionButton?.textContent).toContain(MOCK_SONNER_ACTION_LABEL);
    },
);

WithAction.test(
    "should execute action when clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show toast with action/i,
        });
        await userEvent.click(button);

        const toastElement = await waitForSonnerToast();
        const actionButton = toastElement.querySelector("button");
        if (!actionButton) {
            // @ts-expect-error - Action button not found
            throw new Error("Action button not found");
        }

        await userEvent.click(actionButton);

        await waitForSonnerToastByType("success");
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
                toast(MOCK_SONNER_MESSAGE_WITH_CLOSE_BUTTON, {
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

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();

        const closeButton = toastElement.querySelector(
            '[data-close-button="true"]',
        );
        expect(closeButton).toBeInTheDocument();
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

        await waitForSonnerToastToDisappear();
    },
);

export const CustomDuration = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast(MOCK_SONNER_MESSAGE_LONG_DURATION, {
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

        await waitForSonnerToast();
    },
);

export const AutoDismiss = meta.story({
    render: () => (
        <>
            <Button
                onClick={() => {
                    toast(MOCK_SONNER_MESSAGE_AUTO_DISMISS, {
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

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();

        await waitForSonnerToastToDisappear({ timeout: 3000 });
    },
);

AutoDismiss.test(
    "should pause dismiss timer while hovered and dismiss after unhover",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button", {
            name: /show auto-dismiss toast/i,
        });

        await userEvent.click(button);

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();

        await userEvent.hover(toastElement);

        await new Promise(resolve => setTimeout(resolve, 2000));

        expect(getSonnerToast()).toBeInTheDocument();

        await userEvent.unhover(toastElement);

        await waitForSonnerToastToDisappear({ timeout: 3000 });
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
                        loading: MOCK_SONNER_UPLOAD_LOADING,
                        success: (data: { name: string }) =>
                            MOCK_SONNER_UPLOAD_SUCCESS(data.name),
                        error: MOCK_SONNER_UPLOAD_ERROR,
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

        const toastElement = await waitForSonnerToast();
        expect(toastElement).toBeInTheDocument();
        expect(toastElement).toHaveAttribute("data-type", "loading");

        await waitFor(
            () => {
                const toastElement = getSonnerToastByType("success");
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
            <Button onClick={() => toast.success(MOCK_SONNER_MESSAGE_SUCCESS)}>
                Success
            </Button>
            <Button onClick={() => toast.error(MOCK_SONNER_MESSAGE_ERROR)}>
                Error
            </Button>
            <Button
                variant="outline"
                onClick={() => toast.warning(MOCK_SONNER_MESSAGE_WARNING)}
            >
                Warning
            </Button>
            <Button
                variant="secondary"
                onClick={() => toast.info(MOCK_SONNER_MESSAGE_INFO)}
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

        await waitForSonnerToastByType("success");
    },
);

RichColors.test("should display error toast", async ({ canvas, userEvent }) => {
    const errorButton = canvas.getByRole("button", {
        name: /^error$/i,
    });
    await userEvent.click(errorButton);

    await waitForSonnerToastByType("error");
});

RichColors.test(
    "should display warning toast",
    async ({ canvas, userEvent }) => {
        const warningButton = canvas.getByRole("button", {
            name: /^warning$/i,
        });
        await userEvent.click(warningButton);

        await waitForSonnerToastByType("warning");
    },
);

RichColors.test("should display info toast", async ({ canvas, userEvent }) => {
    const infoButton = canvas.getByRole("button", {
        name: /^info$/i,
    });
    await userEvent.click(infoButton);

    await waitForSonnerToastByType("info");
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

        await waitForSonnerToast();
    },
);

Positions.test(
    "should show toast in top center position",
    async ({ canvas, userEvent }) => {
        const topCenterButton = canvas.getByRole("button", {
            name: /top center/i,
        });
        await userEvent.click(topCenterButton);

        await waitForSonnerToast();
    },
);

Positions.test(
    "should show toast in top right position",
    async ({ canvas, userEvent }) => {
        const topRightButton = canvas.getByRole("button", {
            name: /top right/i,
        });
        await userEvent.click(topRightButton);

        await waitForSonnerToast();
    },
);

Positions.test(
    "should show toast in bottom left position",
    async ({ canvas, userEvent }) => {
        const bottomLeftButton = canvas.getByRole("button", {
            name: /bottom left/i,
        });
        await userEvent.click(bottomLeftButton);

        await waitForSonnerToast();
    },
);

Positions.test(
    "should show toast in bottom center position",
    async ({ canvas, userEvent }) => {
        const bottomCenterButton = canvas.getByRole("button", {
            name: /bottom center/i,
        });
        await userEvent.click(bottomCenterButton);
        await waitForSonnerToast();
    },
);

Positions.test(
    "should show toast in bottom right position",
    async ({ canvas, userEvent }) => {
        const bottomRightButton = canvas.getByRole("button", {
            name: /bottom right/i,
        });
        await userEvent.click(bottomRightButton);
        await waitForSonnerToast();
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
                            toastId = toast(MOCK_SONNER_MESSAGE_PERSISTENT, {
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

        await waitForSonnerToast();

        const dismissButton = canvas.getByRole("button", {
            name: /dismiss toast/i,
        });
        await userEvent.click(dismissButton);

        await waitForSonnerToastToDisappear();
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
            const toasts = getAllSonnerToasts();
            expect(toasts.length).toBeGreaterThanOrEqual(1);
        });

        const dismissAllButton = canvas.getByRole("button", {
            name: /dismiss all/i,
        });
        await userEvent.click(dismissAllButton);

        await waitFor(() => {
            const toasts = getAllSonnerToasts();
            expect(toasts.length).toBe(0);
        });
    },
);

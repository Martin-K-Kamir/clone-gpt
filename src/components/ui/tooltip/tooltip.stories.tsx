import preview from "#.storybook/preview";
import { IconInfoCircle } from "@tabler/icons-react";
import { expect, fn, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";

import { Tooltip } from "./tooltip";
import { TooltipContent } from "./tooltip-content";
import { TooltipTrigger } from "./tooltip-trigger";

const meta = preview.meta({
    component: Tooltip,
    render: args => (
        <div className="flex min-h-[200px] items-center justify-center">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>This is a tooltip</TooltipContent>
            </Tooltip>
        </div>
    ),
    tags: ["autodocs"],
    args: {
        delayDuration: 0,
        onOpenChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        delayDuration: {
            control: "number",
            description:
                "The delay before showing the tooltip (in milliseconds)",
            table: {
                type: {
                    summary: "number",
                },
                defaultValue: {
                    summary: "0",
                },
            },
        },
        disableHoverableContent: {
            control: "boolean",
            description: "Whether the tooltip content can be hovered",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultOpen: {
            control: "boolean",
            description: "The default open state when uncontrolled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        open: {
            control: "boolean",
            description: "The controlled open state of the tooltip",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onOpenChange: {
            description: "Callback when the open state changes",
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
        chromatic: { disableSnapshot: true },
    },
});

Default.test("should show tooltip on hover", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");

    await userEvent.hover(button);

    await waitFor(() => {
        const tooltipContent = document.querySelector(
            '[data-slot="tooltip-content"]',
        );
        expect(tooltipContent).toBeVisible();
        expect(tooltipContent).toHaveTextContent("This is a tooltip");
    });
});

Default.test(
    "should hide tooltip on unhover",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            );
            expect(tooltipContent).toBeVisible();
        });

        await userEvent.unhover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            );
            expect(tooltipContent).not.toBeVisible();
        });
    },
);

Default.test(
    "should call onOpenChange when hovering",
    async ({ canvas, userEvent, args }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            expect(args.onOpenChange).toHaveBeenCalledWith(true);
        });
    },
);

export const WithCustomContent = meta.story({
    name: "With Custom Content",
    render: args => (
        <div className="flex min-h-[200px] items-center justify-center">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button variant="outline">Info</Button>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex items-center gap-2">
                        <IconInfoCircle className="size-4" />
                        <span>
                            This tooltip has custom content with an icon
                        </span>
                    </div>
                </TooltipContent>
            </Tooltip>
        </div>
    ),
});

WithCustomContent.test(
    "should display custom content",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            );
            expect(tooltipContent).toBeVisible();
            expect(tooltipContent).toHaveTextContent(
                "This tooltip has custom content with an icon",
            );
        });
    },
);

export const Top = meta.story({
    name: "Position Top",
    render: args => (
        <div className="flex min-h-[200px] items-end justify-center pb-20">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent side="top">Tooltip on top</TooltipContent>
            </Tooltip>
        </div>
    ),
});

Top.test("should position tooltip on top", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");
    await userEvent.hover(button);

    await waitFor(() => {
        const tooltipContent = document.querySelector(
            '[data-slot="tooltip-content"]',
        ) as HTMLElement;
        expect(tooltipContent).toBeVisible();
        expect(tooltipContent).toHaveAttribute("data-side", "top");
    });
});

export const Bottom = meta.story({
    name: "Position Bottom",
    render: args => (
        <div className="flex min-h-[200px] items-start justify-center pt-20">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Tooltip on bottom</TooltipContent>
            </Tooltip>
        </div>
    ),
});

Bottom.test(
    "should position tooltip on bottom",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            ) as HTMLElement;
            expect(tooltipContent).toBeVisible();
            expect(tooltipContent).toHaveAttribute("data-side", "bottom");
        });
    },
);

export const Left = meta.story({
    name: "Position Left",
    render: args => (
        <div className="flex min-h-[200px] items-center justify-end pr-20">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent side="left">Tooltip on left</TooltipContent>
            </Tooltip>
        </div>
    ),
});

Left.test("should position tooltip on left", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");
    await userEvent.hover(button);

    await waitFor(() => {
        const tooltipContent = document.querySelector(
            '[data-slot="tooltip-content"]',
        ) as HTMLElement;
        expect(tooltipContent).toBeVisible();
        expect(tooltipContent).toHaveAttribute("data-side", "left");
    });
});

export const Right = meta.story({
    name: "Position Right",
    render: args => (
        <div className="flex min-h-[200px] items-center justify-start pl-20">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent side="right">Tooltip on right</TooltipContent>
            </Tooltip>
        </div>
    ),
});

Right.test(
    "should position tooltip on right",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            ) as HTMLElement;
            expect(tooltipContent).toBeVisible();
            expect(tooltipContent).toHaveAttribute("data-side", "right");
        });
    },
);

export const WithDelay = meta.story({
    name: "With Delay",
    args: {
        delayDuration: 500,
    },
    render: args => (
        <div className="flex min-h-[200px] items-center justify-center">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me (500ms delay)</Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip with delay</TooltipContent>
            </Tooltip>
        </div>
    ),
});

WithDelay.test(
    "should delay tooltip appearance",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            );
            expect(tooltipContent).toBeNull();
        });

        await waitFor(
            () => {
                const tooltipContent = document.querySelector(
                    '[data-slot="tooltip-content"]',
                );
                expect(tooltipContent).toBeVisible();
            },
            { timeout: 600 },
        );
    },
);

export const WithCustomStyling = meta.story({
    name: "With Custom Styling",
    render: args => (
        <div className="flex min-h-[200px] items-center justify-center">
            <Tooltip {...args}>
                <TooltipTrigger asChild>
                    <Button>Hover me</Button>
                </TooltipTrigger>
                <TooltipContent
                    className="bg-blue-600 text-white"
                    sideOffset={6}
                >
                    Custom styled tooltip
                </TooltipContent>
            </Tooltip>
        </div>
    ),
});

WithCustomStyling.test(
    "should apply custom styling",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            ) as HTMLElement;
            expect(tooltipContent).toBeVisible();
        });
    },
);

export const WithDisabledTrigger = meta.story({
    name: "With Disabled Trigger",
    render: args => (
        <div className="flex min-h-[200px] items-center justify-center">
            <Tooltip {...args}>
                <TooltipTrigger asChild disabled>
                    <Button disabled>Disabled button</Button>
                </TooltipTrigger>
                <TooltipContent>This tooltip should not show</TooltipContent>
            </Tooltip>
        </div>
    ),
});

WithDisabledTrigger.test(
    "should not show tooltip on disabled trigger",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        expect(button).toBeDisabled();

        try {
            await userEvent.hover(button);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        await waitFor(() => {
            const tooltipContent = document.querySelector(
                '[data-slot="tooltip-content"]',
            );
            expect(tooltipContent).toBeNull();
        });
    },
);

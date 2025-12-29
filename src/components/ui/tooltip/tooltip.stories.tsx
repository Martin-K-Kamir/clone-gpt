import { getTooltip } from "#.storybook/lib/utils/elements";
import {
    waitForElement,
    waitForTooltip,
} from "#.storybook/lib/utils/test-helpers";
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

    const tooltip = await waitForTooltip();
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("This is a tooltip");
});

Default.test(
    "should hide tooltip on unhover",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        const tooltip = await waitForTooltip();
        expect(tooltip).toBeInTheDocument();

        await userEvent.unhover(button);

        await new Promise(resolve => setTimeout(resolve, 100));
        const tooltipAfterUnhover = await waitForElement(
            '[data-slot="tooltip-content"]',
        );
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(tooltipAfterUnhover).not.toBeInTheDocument();
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

        const tooltip = await waitForTooltip();
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(
            "This tooltip has custom content with an icon",
        );
    },
);

export const SideTop = meta.story({
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

SideTop.test(
    "should position tooltip on top",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        const tooltip = (await waitForTooltip()) as HTMLElement;
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute("data-side", "top");
    },
);

export const SideBottom = meta.story({
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

SideBottom.test(
    "should position tooltip on bottom",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        const tooltipContent = await waitForTooltip();
        expect(tooltipContent).toBeInTheDocument();
        expect(tooltipContent).toHaveAttribute("data-side", "bottom");
    },
);

export const SideLeft = meta.story({
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

SideLeft.test(
    "should position tooltip on left",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        const tooltipContent = await waitForTooltip();
        expect(tooltipContent).toBeInTheDocument();
        expect(tooltipContent).toHaveAttribute("data-side", "left");
    },
);

export const SideRight = meta.story({
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

SideRight.test(
    "should position tooltip on right",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.hover(button);

        const tooltipContent = await waitForTooltip();
        expect(tooltipContent).toBeInTheDocument();
        expect(tooltipContent).toHaveAttribute("data-side", "right");
    },
);

export const WithDelay = meta.story({
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

        await new Promise(resolve => setTimeout(resolve, 100));
        const tooltipBeforeDelay = getTooltip();
        expect(tooltipBeforeDelay).toBeNull();

        const tooltip = await waitForTooltip({ timeout: 600 });
        expect(tooltip).toBeInTheDocument();
    },
);

export const WithCustomStyling = meta.story({
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

        const tooltip = await waitForTooltip();
        expect(tooltip).toBeInTheDocument();
    },
);

export const WithDisabledTrigger = meta.story({
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

        const tooltipContent = getTooltip();
        expect(tooltipContent).toBeNull();
    },
);

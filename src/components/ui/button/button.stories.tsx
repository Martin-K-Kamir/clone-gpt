import preview from "#.storybook/preview";
import { IconPencil } from "@tabler/icons-react";
import { expect, fireEvent, fn, waitFor } from "storybook/test";

import { Button } from "./button";
import { BUTTON_SIZES, BUTTON_VARIANTS } from "./button.variants";

const meta = preview.meta({
    component: Button,
    tags: ["autodocs"],
    args: {
        children: "Button",
        onClick: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        children: {
            control: "object",
            description: "The content of the button",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        variant: {
            control: "select",
            description: "The variant of the button",
            options: [...BUTTON_VARIANTS],
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "default",
                },
            },
        },
        size: {
            control: "select",
            description: "The size of the button",
            options: [...BUTTON_SIZES],
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "default",
                },
            },
        },
        asChild: {
            control: "boolean",
            description: "Whether the button is a child of another component",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        as: {
            control: "select",
            description: "The component to render the button as",
        },
        styled: {
            control: "boolean",
            description: "Whether the button is styled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the button is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
    },
});

export const Default = meta.story();

Default.test("should be interactive", async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole("button");
    expect(button).toBeEnabled();
    expect(button).toBeVisible();
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
    await userEvent.tripleClick(button);
    expect(args.onClick).toHaveBeenCalledTimes(4);
    await userEvent.hover(button);
    await userEvent.unhover(button);
});

export const Destructive = meta.story({
    args: {
        variant: "destructive",
    },
});

export const Outline = meta.story({
    args: {
        variant: "outline",
    },
});

export const Secondary = meta.story({
    args: {
        variant: "secondary",
    },
});

export const Tertiary = meta.story({
    args: {
        variant: "tertiary",
    },
});

export const Ghost = meta.story({
    args: {
        variant: "ghost",
    },
});

export const Link = meta.story({
    args: {
        variant: "link",
    },
});

export const Loading = meta.story({
    args: {
        isLoading: true,
    },
});

export const WithTooltip = meta.story({
    args: {
        tooltip: "Tooltip",
        tooltipContentProps: {
            side: "bottom",
            sideOffset: 5,
            className: "bg-zinc-800",
        },
    },
});

WithTooltip.test("should show tooltip", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("button");
    await userEvent.hover(button);

    await waitFor(() => {
        const tooltipContent = document.querySelector(
            '[data-slot="tooltip-content"]',
        );
        expect(tooltipContent).toBeVisible();
    });
});

export const IconOnly = meta.story({
    args: {
        children: <IconPencil />,
        "aria-label": "Edit",
        size: "icon",
    },
});

export const SizeNone = meta.story({
    args: {
        size: "none",
    },
});

export const SizeXs = meta.story({
    args: {
        size: "xs",
    },
});

export const SizeSm = meta.story({
    args: {
        size: "sm",
    },
});

export const SizeLg = meta.story({
    args: {
        size: "lg",
    },
});

export const Unstyled = meta.story({
    args: {
        styled: false,
    },
});

export const Disabled = meta.story({
    args: {
        disabled: true,
    },
});

Disabled.test("should be disabled", async ({ canvas, args }) => {
    const button = await canvas.findByRole("button");
    fireEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
});

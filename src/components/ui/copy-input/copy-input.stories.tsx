import preview from "#.storybook/preview";
import { IconThumbUp, IconThumbUpFilled } from "@tabler/icons-react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { CopyInput } from "./copy-input";

const meta = preview.meta({
    component: CopyInput,
    tags: ["autodocs"],
    args: {
        value: "example-value-to-copy",
        className: "bg-zinc-900",
        onCopy: fn(),
        onCopyError: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        value: {
            control: "text",
            description: "The value to display and copy",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        label: {
            control: "text",
            description: "The label text for the input (screen reader only)",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
                defaultValue: {
                    summary: "Copy value to clipboard",
                },
            },
        },
        copyResetDelay: {
            control: "number",
            description:
                "Delay in milliseconds before resetting the copied state",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        onCopy: {
            control: false,
            description: "Callback function called when copy succeeds",
            table: {
                type: {
                    summary: "(value: string) => void",
                },
            },
        },
        onCopyError: {
            control: false,
            description: "Callback function called when copy fails",
            table: {
                type: {
                    summary: "(message: string) => void",
                },
            },
        },
        showIcon: {
            control: "boolean",
            description: "Whether to show the icon in the button",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        iconPosition: {
            control: "select",
            description: "Position of the icon in the button",
            options: ["left", "right"],
            table: {
                type: {
                    summary: '"left" | "right"',
                },
                defaultValue: {
                    summary: '"left"',
                },
            },
        },
        labelProps: {
            control: "object",
            description: "Props to pass to the label element",
            table: {
                type: {
                    summary: "Omit<React.ComponentProps<'label'>, 'children'>",
                },
            },
        },
        buttonProps: {
            control: "object",
            description: "Props to pass to the copy button",
            table: {
                type: {
                    summary:
                        "Omit<React.ComponentProps<typeof Button>, 'children'>",
                },
            },
        },
        inputProps: {
            control: "object",
            description:
                "Props to pass to the input field (value and onChange are omitted)",
            table: {
                type: {
                    summary:
                        "Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>",
                },
            },
        },
        copyIcon: {
            control: "object",
            description: "Custom icon to display when not copied",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        copiedIcon: {
            control: "object",
            description: "Custom icon to display when copied",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        copyText: {
            control: "text",
            description: "Custom text to display when not copied",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        copiedText: {
            control: "text",
            description: "Custom text to display when copied",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        children: {
            control: "object",
            description:
                "Custom button content or function that receives handleCopy and copied state",
            table: {
                type: {
                    summary:
                        "React.ReactNode | ((handleCopy: () => void, copied: boolean) => React.ReactNode)",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the container",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story();

Default.test(
    "should display value and copy it when clicked",
    async ({ canvas, args }) => {
        const input = canvas.getByDisplayValue(args.value);
        expect(input).toBeVisible();

        const button = await canvas.findByRole("button", {
            name: /copy/i,
        });
        expect(button).toBeVisible();

        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onCopy).toHaveBeenCalledWith(args.value);
        });

        canvas.getByText("Copied", { exact: false });
    },
);

Default.test(
    "should call onCopy callback when button is clicked",
    async ({ canvas, args }) => {
        const button = canvas.getByRole("button", {
            name: /copy/i,
        });

        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onCopy).toHaveBeenCalledWith(args.value);
        });
    },
);

Default.test(
    "should copy value to clipboard when button is clicked",
    async ({ canvas, args }) => {
        const button = canvas.getByRole("button", {
            name: /copy/i,
        });

        await userEvent.click(button);

        await waitFor(() => {
            expect(navigator.clipboard.readText()).resolves.toBe(args.value);
        });
    },
);

export const CustomTextAndIcons = meta.story({
    args: {
        value: "custom-value-123",
        copyIcon: <IconThumbUp />,
        copiedIcon: <IconThumbUpFilled />,
        copyText: "Custom Copy",
        copiedText: "Custom Copied",
    },
});

export const IconOnRight = meta.story({
    args: {
        value: "value-with-icon-on-right",
        iconPosition: "right",
    },
});

export const WithoutIcon = meta.story({
    args: {
        value: "value-without-icon",
        showIcon: false,
    },
});

export const CustomResetDelay = meta.story({
    args: {
        value: "value-with-custom-delay",
        copyResetDelay: 5000,
    },
});

export const CustomChildren = meta.story({
    args: {
        value: "custom-value-to-copy",
        children: (handleCopy, copied) => (
            <button
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
            >
                {copied ? "👍 Copied" : "👍 Copy"}
            </button>
        ),
    },
});

CustomChildren.test(
    "should work with custom button children",
    async ({ canvas, args }) => {
        const button = canvas.getByRole("button", {
            name: /copy/i,
        });
        await expect(button).toBeVisible();

        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onCopy).toHaveBeenCalledWith(args.value);
        });

        await canvas.findByText("👍 Copied");
    },
);

CustomChildren.test(
    "should call onCopy callback when button is clicked",
    async ({ canvas, args }) => {
        const button = canvas.getByRole("button", {
            name: /copy/i,
        });
        await userEvent.click(button);

        await waitFor(() => {
            expect(args.onCopy).toHaveBeenCalledWith(args.value);
        });
    },
);

CustomChildren.test(
    "should copy value to clipboard when button is clicked",
    async ({ canvas, args }) => {
        const button = canvas.getByRole("button", {
            name: /copy/i,
        });
        await userEvent.click(button);

        await waitFor(() => {
            expect(navigator.clipboard.readText()).resolves.toBe(args.value);
        });
    },
);

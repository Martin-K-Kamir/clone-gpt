import { AppProviders } from "#.storybook/lib/decorators/providers";
import { waitForTooltip } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, fn, waitFor } from "storybook/test";

import { ChatMessageActionsUser } from "./chat-message-actions-user";

const meta = preview.meta({
    component: ChatMessageActionsUser,
    decorators: [
        Story => (
            <AppProviders>
                <div className="flex min-h-[200px] items-center justify-center bg-zinc-950 p-8">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
    args: {
        content: "This is a sample message content that can be copied.",
        onUpdate: fn(),
    },
    argTypes: {
        content: {
            control: "text",
            description: "The message content to be copied",
        },
        onUpdate: {
            control: false,
            description:
                "Callback function called when update button is clicked",
            table: {
                type: {
                    summary: "() => void",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether all action buttons are disabled",
        },
        showUpdate: {
            control: "boolean",
            description: "Whether to show the update button",
        },
        showCopy: {
            control: "boolean",
            description: "Whether to show the copy button",
        },
    },
});

export const Default = meta.story({});

Default.test("should render copy and update buttons", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const updateButton = canvas.getByRole("button", { name: /update/i });

    expect(copyButton).toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
});

Default.test("should show tooltips on hover", async ({ canvas, userEvent }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    await userEvent.hover(copyButton);

    const tooltip = await waitForTooltip();
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Copy");
});

Default.test(
    "should copy content when copy button is clicked",
    async ({ canvas, userEvent, args }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        await userEvent.click(copyButton);

        await waitFor(() => {
            const checkIcon = copyButton.querySelector("svg");
            expect(checkIcon).toBeInTheDocument();
        });

        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            expect(clipboardText).toBe(args.content);
        }
    },
);

Default.test(
    "should call onUpdate when update button is clicked",
    async ({ canvas, userEvent, args }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        expect(args.onUpdate).toHaveBeenCalledTimes(1);
    },
);

export const WithoutUpdate = meta.story({
    args: {
        content: "This message cannot be updated.",
        showUpdate: false,
    },
});

WithoutUpdate.test("should only show copy button", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const updateButton = canvas.queryByRole("button", {
        name: /update/i,
    });

    expect(copyButton).toBeInTheDocument();
    expect(updateButton).not.toBeInTheDocument();
});

export const WithoutCopy = meta.story({
    args: {
        content: "This message cannot be copied.",
        showCopy: false,
    },
});

WithoutCopy.test("should only show update button", async ({ canvas }) => {
    const copyButton = canvas.queryByRole("button", { name: /copy/i });
    const updateButton = canvas.getByRole("button", { name: /update/i });

    expect(copyButton).not.toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
});

export const Disabled = meta.story({
    args: {
        content: "This message is disabled.",
        disabled: true,
    },
});

Disabled.test(
    "should disable all buttons",
    async ({ canvas, userEvent, args }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.getByRole("button", { name: /update/i });

        expect(copyButton).toBeDisabled();
        expect(updateButton).toBeDisabled();

        try {
            await userEvent.click(copyButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(updateButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        expect(args.onUpdate).not.toHaveBeenCalled();
    },
);

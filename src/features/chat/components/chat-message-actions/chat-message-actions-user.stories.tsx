import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { ChatMessageActionsUser } from "./chat-message-actions-user";

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                staleTime: 60 * 1000,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
            },
        },
    });
}

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <UserCacheSyncProvider>
                        <div className="flex min-h-[200px] items-center justify-center bg-zinc-950 p-8">
                            <Story />
                        </div>
                    </UserCacheSyncProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: ChatMessageActionsUser,
    decorators: [Story => <StoryWrapper Story={Story} />],
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

export const Default = meta.story({
    name: "Default",
});

Default.test("should render copy and update buttons", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    const updateButton = canvas.getByRole("button", { name: /update/i });

    expect(copyButton).toBeInTheDocument();
    expect(updateButton).toBeInTheDocument();
});

Default.test("should show tooltips on hover", async ({ canvas, userEvent }) => {
    const copyButton = canvas.getByRole("button", { name: /copy/i });
    await userEvent.hover(copyButton);

    await waitFor(() => {
        const tooltip = document.querySelector('[data-slot="tooltip-content"]');
        expect(tooltip).toBeVisible();
        expect(tooltip).toHaveTextContent("Copy");
    });
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
    name: "Without Update Button",
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
    name: "Without Copy Button",
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
    name: "Disabled",
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

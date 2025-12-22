import preview from "#.storybook/preview";
import { ChatStatus } from "ai";
import { expect, waitFor } from "storybook/test";

import { RateLimitError } from "@/lib/classes";
import { RATE_LIMIT_REASON } from "@/lib/constants";

import { ChatMessagesError } from "./chat-messages-error";

const meta = preview.meta({
    component: ChatMessagesError,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {
        status: "error" as ChatStatus,
        error: new Error("Failed to process request"),
    },
});

Default.test("should render error message", async ({ canvas }) => {
    await waitFor(() => {
        const errorMessage = canvas.getByText(
            /something went wrong\. please try again\./i,
        );
        expect(errorMessage).toBeInTheDocument();
    });
});

export const WithCustomTitle = meta.story({
    args: {
        status: "error" as ChatStatus,
        error: new Error("Network connection failed"),
        title: "Unable to connect to the server",
    },
});

WithCustomTitle.test("should render custom title", async ({ canvas }) => {
    await waitFor(() => {
        const customTitle = canvas.getByText(
            /unable to connect to the server/i,
        );
        expect(customTitle).toBeInTheDocument();
    });
});

export const WithoutErrorMessage = meta.story({
    args: {
        status: "error" as ChatStatus,
        error: new Error(),
    },
});

WithoutErrorMessage.test(
    "should render without error reason",
    async ({ canvas }) => {
        await waitFor(() => {
            const errorMessage = canvas.getByText(
                /something went wrong\. please try again\./i,
            );
            expect(errorMessage).toBeInTheDocument();
        });

        const errorReason = canvas.queryByText(/reason:/i);
        expect(errorReason).not.toBeInTheDocument();
    },
);

export const LongErrorMessage = meta.story({
    args: {
        status: "error" as ChatStatus,
        error: new Error(
            "This is a very long error message that contains multiple sentences and detailed information about what went wrong. It includes technical details, error codes, and suggestions for how to fix the issue. The message should wrap properly and remain readable.",
        ),
    },
});

import { AppProviders } from "#.storybook/lib/decorators/providers";
import { MOCK_CHAT_BUTTON_CLOSE_RATE_LIMIT_INFO } from "#.storybook/lib/mocks/chat";
import {
    FIXED_DATE_PLUS_24H,
    createMockFilesRateLimit,
    createMockMessagesRateLimit,
} from "#.storybook/lib/mocks/rate-limits";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { formatDateTime } from "@/lib/utils";

import { ChatComposerInfo } from "./chat-composer-info";

const meta = preview.meta({
    component: ChatComposerInfo,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="bg-zinc-925 grid min-h-svh w-full items-center">
                    <div className="relative mx-auto w-full max-w-3xl">
                        <Story />
                    </div>
                </div>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({});

Default.test(
    "should not render rate limit info when no rate limit",
    async ({ canvas }) => {
        const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
        expect(rateLimit).not.toBeInTheDocument();
    },
);

export const WithMessagesRateLimit = meta.story({
    parameters: {
        provider: {
            rateLimitMessages: createMockMessagesRateLimit(),
        },
    },
});

WithMessagesRateLimit.test(
    "should show messages rate limit info",
    async ({ canvas }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();
    },
);

WithMessagesRateLimit.test(
    "should show the correct date time",
    async ({ canvas }) => {
        const dateTime = canvas.getByText(
            new RegExp(formatDateTime(FIXED_DATE_PLUS_24H), "i"),
        );
        expect(dateTime).toBeInTheDocument();
    },
);

WithMessagesRateLimit.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();

        const closeButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_CLOSE_RATE_LIMIT_INFO,
        });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);

        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).not.toBeInTheDocument();
        });
    },
);

export const WithFilesRateLimit = meta.story({
    parameters: {
        provider: {
            rateLimitFiles: createMockFilesRateLimit(),
        },
    },
});

WithFilesRateLimit.test(
    "should show files rate limit info",
    async ({ canvas }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();
    },
);

WithFilesRateLimit.test(
    "should show the correct date time",
    async ({ canvas }) => {
        const dateTime = canvas.getByText(
            new RegExp(formatDateTime(FIXED_DATE_PLUS_24H), "i"),
        );
        expect(dateTime).toBeInTheDocument();
    },
);

WithFilesRateLimit.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();

        const closeButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_CLOSE_RATE_LIMIT_INFO,
        });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);

        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).not.toBeInTheDocument();
        });
    },
);

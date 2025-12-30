import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_COPY,
    MOCK_CHAT_BUTTON_DOWNVOTE,
    MOCK_CHAT_BUTTON_SOURCES,
    MOCK_CHAT_BUTTON_TRY_AGAIN,
    MOCK_CHAT_BUTTON_UPVOTE,
    MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
} from "#.storybook/lib/mocks/chat";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_ASSISTANT_MESSAGE_ID,
    MOCK_ASSISTANT_MESSAGE_PARTS_WITH_SOURCES,
    createMockAssistantMessageMetadata,
    createMockDownvoteResponseData,
    createMockTextMessagePart,
    createMockUpvoteResponseData,
} from "#.storybook/lib/mocks/messages";
import { createMockMessagesRateLimit } from "#.storybook/lib/mocks/rate-limits";
import { waitForDialog } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked } from "storybook/test";

import { downvoteChatMessage } from "@/features/chat/services/actions/downvote-chat-message";
import { upvoteChatMessage } from "@/features/chat/services/actions/upvote-chat-message";

import { api } from "@/lib/api-response";

import { ChatMessageToolbarAssistant } from "./chat-message-toolbar-assistant";

const meta = preview.meta({
    component: ChatMessageToolbarAssistant,
    decorators: [
        (Story, { parameters }) => {
            return (
                <AppProviders {...parameters.provider}>
                    <div className="group/message flex min-h-[200px] items-center justify-center bg-zinc-950">
                        <Story />
                    </div>
                </AppProviders>
            );
        },
    ],
    args: {
        canShowActions: true,
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        parts: [createMockTextMessagePart(MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT)],
        metadata: createMockAssistantMessageMetadata(),
    },
    beforeEach: () => {
        mocked(upvoteChatMessage).mockResolvedValue(
            api.success.chat.upvote(createMockUpvoteResponseData()) as any,
        );
        mocked(downvoteChatMessage).mockResolvedValue(
            api.success.chat.downvote(createMockDownvoteResponseData()) as any,
        );
    },
    argTypes: {
        canShowActions: {
            control: "boolean",
            description: "Whether to show the toolbar",
        },
        chatId: {
            control: false,
            description: "The chat ID",
        },
        messageId: {
            control: false,
            description: "The message ID",
        },
        content: {
            control: "text",
            description: "The message content",
        },
        parts: {
            control: false,
            description: "The message parts",
        },
        metadata: {
            control: false,
            description: "The message metadata",
        },
        disabled: {
            control: "boolean",
            description: "Whether all action buttons are disabled",
        },
    },
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({});

export const NotOwner = meta.story({
    parameters: {
        provider: {
            isOwner: false,
        },
    },
});

NotOwner.test(
    "should not show regenerate and vote buttons when user is not owner",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const regenerateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_TRY_AGAIN, "i"),
        });
        const upvoteButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPVOTE, "i"),
        });
        const downvoteButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(regenerateButton).not.toBeInTheDocument();
        expect(upvoteButton).not.toBeInTheDocument();
        expect(downvoteButton).not.toBeInTheDocument();
    },
);

export const RateLimitExceeded = meta.story({
    parameters: {
        provider: {
            rateLimit: createMockMessagesRateLimit({
                isOverLimit: true,
                tokensCounter: 1000,
                messagesCounter: 100,
            }),
            isOwner: true,
        },
    },
});

RateLimitExceeded.test(
    "should not show regenerate button when rate limit is exceeded",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const regenerateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_TRY_AGAIN, "i"),
        });
        const upvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPVOTE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(regenerateButton).not.toBeInTheDocument();
        expect(upvoteButton).toBeInTheDocument();
    },
);

export const Disabled = meta.story({
    args: {
        disabled: true,
    },
});

Disabled.test("should disable all buttons", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
    });
    const regenerateButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_TRY_AGAIN, "i"),
    });
    const upvoteButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_UPVOTE, "i"),
    });
    const downvoteButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTE, "i"),
    });

    expect(copyButton).toBeDisabled();
    expect(regenerateButton).toBeDisabled();
    expect(upvoteButton).toBeDisabled();
    expect(downvoteButton).toBeDisabled();
});

export const WithSources = meta.story({
    args: {
        parts: MOCK_ASSISTANT_MESSAGE_PARTS_WITH_SOURCES,
    },
});

WithSources.test(
    "should show image icons of the sources",
    async ({ canvas }) => {
        const sourceIcons = canvas.getAllByRole("img");
        expect(sourceIcons.length).toBeGreaterThan(0);
    },
);

WithSources.test(
    "should open source dialog when source button is clicked",
    async ({ canvas, userEvent }) => {
        const sourceButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_SOURCES, "i"),
        });
        await userEvent.click(sourceButton);

        await waitForDialog("dialog");
    },
);

export const Hidden = meta.story({
    args: {
        canShowActions: false,
    },
});

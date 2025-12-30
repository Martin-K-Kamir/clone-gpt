import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_COPY,
    MOCK_CHAT_BUTTON_DOWNVOTE,
    MOCK_CHAT_BUTTON_DOWNVOTED,
    MOCK_CHAT_BUTTON_TRY_AGAIN,
    MOCK_CHAT_BUTTON_UPVOTE,
    MOCK_CHAT_BUTTON_UPVOTED,
    MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
} from "#.storybook/lib/mocks/chat";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_ASSISTANT_MESSAGE_ID,
    createMockAssistantMessageMetadata,
    createMockDownvoteResponseData,
    createMockUpvoteResponseData,
} from "#.storybook/lib/mocks/messages";
import { waitForTooltip } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { downvoteChatMessage } from "@/features/chat/services/actions/downvote-chat-message";
import { upvoteChatMessage } from "@/features/chat/services/actions/upvote-chat-message";

import { api } from "@/lib/api-response";

import { ChatMessageActionsAssistant } from "./chat-message-actions-assistant";

const meta = preview.meta({
    component: ChatMessageActionsAssistant,
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
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
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
});

export const Default = meta.story({});

Default.test("should render all action buttons", async ({ canvas }) => {
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

    expect(copyButton).toBeInTheDocument();
    expect(regenerateButton).toBeInTheDocument();
    expect(upvoteButton).toBeInTheDocument();
    expect(downvoteButton).toBeInTheDocument();
});

Default.test("should show tooltips on hover", async ({ canvas, userEvent }) => {
    const copyButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
    });
    await userEvent.hover(copyButton);

    const tooltip = await waitForTooltip();
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(MOCK_CHAT_BUTTON_COPY);
});

Default.test(
    "should copy content when copy button is clicked",
    async ({ canvas, userEvent, args }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        await userEvent.click(copyButton);

        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            expect(clipboardText).toBe(args.content);
        }
    },
);

Default.test(
    "should upvote message when upvote button is clicked",
    async ({ canvas, userEvent }) => {
        const upvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPVOTE, "i"),
        });
        await userEvent.click(upvoteButton);

        await waitFor(() => {
            expect(mocked(upvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                upvote: true,
            });
        });
    },
);

Default.test(
    "should downvote message when downvote button is clicked",
    async ({ canvas, userEvent }) => {
        const downvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTE, "i"),
        });
        await userEvent.click(downvoteButton);

        await waitFor(() => {
            expect(mocked(downvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                downvote: true,
            });
        });
    },
);

export const Upvoted = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        metadata: createMockAssistantMessageMetadata({
            isUpvoted: true,
            isDownvoted: false,
        }),
    },
});

Upvoted.test("should show upvoted state", async ({ canvas }) => {
    const upvoteButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_UPVOTED, "i"),
    });
    expect(upvoteButton).toBeInTheDocument();
});

Upvoted.test(
    "should remove upvote when clicked again",
    async ({ canvas, userEvent }) => {
        const upvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPVOTED, "i"),
        });
        await userEvent.click(upvoteButton);

        await waitFor(() => {
            expect(mocked(upvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                upvote: false,
            });
        });
    },
);

export const Downvoted = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        metadata: createMockAssistantMessageMetadata({
            isUpvoted: false,
            isDownvoted: true,
        }),
    },
});

Downvoted.test("should show downvoted state", async ({ canvas }) => {
    const downvoteButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTED, "i"),
    });
    expect(downvoteButton).toBeInTheDocument();
});

Downvoted.test(
    "should remove downvote when clicked again",
    async ({ canvas, userEvent }) => {
        const downvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTED, "i"),
        });
        await userEvent.click(downvoteButton);

        await waitFor(() => {
            expect(mocked(downvoteChatMessage)).toHaveBeenCalledWith({
                messageId: MOCK_ASSISTANT_MESSAGE_ID,
                chatId: MOCK_CHAT_ID,
                downvote: false,
            });
        });
    },
);

export const Disabled = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        metadata: createMockAssistantMessageMetadata(),
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

Disabled.test(
    "should not trigger actions when disabled",
    async ({ canvas, userEvent }) => {
        const upvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPVOTE, "i"),
        });
        const downvoteButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTE, "i"),
        });
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const regenerateButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_TRY_AGAIN, "i"),
        });

        try {
            await userEvent.click(upvoteButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await waitFor(() => {
            expect(mocked(upvoteChatMessage)).not.toHaveBeenCalled();
        });

        try {
            await userEvent.click(downvoteButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        await waitFor(() => {
            expect(mocked(downvoteChatMessage)).not.toHaveBeenCalled();
        });

        try {
            await userEvent.click(copyButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }

        try {
            await userEvent.click(regenerateButton);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
        }
    },
);

export const WithoutCopy = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        metadata: createMockAssistantMessageMetadata(),
        showCopy: false,
    },
});

WithoutCopy.test("should not show copy button", async ({ canvas }) => {
    const copyButton = canvas.queryByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
    });
    const regenerateButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_TRY_AGAIN, "i"),
    });

    expect(copyButton).not.toBeInTheDocument();
    expect(regenerateButton).toBeInTheDocument();
});

export const WithoutRegenerate = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        metadata: createMockAssistantMessageMetadata(),
        showRegenerate: false,
    },
});

WithoutRegenerate.test(
    "should not show regenerate button",
    async ({ canvas }) => {
        const regenerateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_TRY_AGAIN, "i"),
        });
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });

        expect(regenerateButton).not.toBeInTheDocument();
        expect(copyButton).toBeInTheDocument();
    },
);

export const WithoutVotes = meta.story({
    args: {
        chatId: MOCK_CHAT_ID,
        messageId: MOCK_ASSISTANT_MESSAGE_ID,
        content: MOCK_CHAT_MESSAGE_SAMPLE_ASSISTANT,
        metadata: createMockAssistantMessageMetadata(),
        showUpvote: false,
        showDownvote: false,
    },
});

WithoutVotes.test("should not show vote buttons", async ({ canvas }) => {
    const upvoteButton = canvas.queryByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_UPVOTE, "i"),
    });
    const downvoteButton = canvas.queryByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_DOWNVOTE, "i"),
    });
    const copyButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
    });

    expect(upvoteButton).not.toBeInTheDocument();
    expect(downvoteButton).not.toBeInTheDocument();
    expect(copyButton).toBeInTheDocument();
});

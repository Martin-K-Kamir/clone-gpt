import { AppProviders } from "#.storybook/lib/decorators/providers";
import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE,
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE,
    MOCK_ASSISTANT_MESSAGE_WITH_MARKDOWN,
    MOCK_ASSISTANT_MESSAGE_WITH_WEATHER,
    MOCK_CHAT_STATUS,
    MOCK_FILE_AND_IMAGE_PARTS,
    MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES,
    MOCK_USER_MESSAGE_WITH_MULTIPLE_IMAGES,
    MOCK_USER_MESSAGE_WITH_SINGLE_FILE,
    MOCK_USER_MESSAGE_WITH_SINGLE_IMAGE,
    createMockAssistantMessage,
    createMockFileMessageParts,
    createMockImageMessageParts,
    createMockUserMessage,
    createMockUserMessageWithFiles,
} from "#.storybook/lib/mocks/messages";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { PureChatMessage } from "./chat-message";

const meta = preview.meta({
    component: PureChatMessage,
    decorators: [
        Story => (
            <AppProviders>
                <Story />
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
        a11y: {
            config: {
                rules: [
                    {
                        id: "color-contrast",
                        enabled: false,
                    },
                ],
            },
        },
    },
});

export const UserMessage = meta.story({
    args: {
        message: createMockUserMessage({
            text: "Hello, how can you help me today?",
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

UserMessage.test("should render user message", async ({ canvas }) => {
    const article = canvas.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute("data-role", "user");
});

UserMessage.test("should display user message text", async ({ canvas }) => {
    const messageText = canvas.getByText(/hello, how can you help me today\?/i);
    expect(messageText).toBeInTheDocument();
});

UserMessage.test(
    "should show action buttons for user message",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", { name: /copy/i });
        const updateButton = canvas.getByRole("button", {
            name: /update/i,
        });
        expect(copyButton).toBeInTheDocument();
        expect(updateButton).toBeInTheDocument();
    },
);

export const UserMessageLong = meta.story({
    args: {
        message: createMockUserMessage({
            text: "This is a very long message that should be truncated because it exceeds the maximum content length limit of 150 characters. When a message is too long, it should show a read more button to expand the content.",
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

UserMessageLong.test(
    "should truncate long user message and show expand button",
    async ({ canvas }) => {
        const expandButton = canvas.getByRole("button", {
            name: /read more/i,
        });
        expect(expandButton).toBeInTheDocument();

        const truncatedText = canvas.getByText(/\.\.\./);
        expect(truncatedText).toBeInTheDocument();
    },
);

UserMessageLong.test(
    "should expand and collapse long message when button is clicked",
    async ({ canvas, userEvent }) => {
        const expandButton = canvas.getByRole("button", {
            name: /read more/i,
        });

        await userEvent.click(expandButton);

        await waitFor(() => {
            const collapseButton = canvas.getByRole("button", {
                name: /read less/i,
            });
            expect(collapseButton).toBeInTheDocument();
        });

        const collapseButton = canvas.getByRole("button", {
            name: /read less/i,
        });
        await userEvent.click(collapseButton);

        await waitFor(() => {
            const expandButtonAgain = canvas.getByRole("button", {
                name: /read more/i,
            });
            expect(expandButtonAgain).toBeInTheDocument();
        });
    },
);

export const UserMessageWithFiles = meta.story({
    args: {
        message: MOCK_USER_MESSAGE_WITH_MULTIPLE_FILES,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

UserMessageWithFiles.test(
    "should render user message with file uploads",
    async ({ canvas }) => {
        const article = canvas.getByRole("article");
        expect(article).toBeInTheDocument();
        expect(article).toHaveAttribute("data-role", "user");

        const messageText = canvas.getByText(/here are some documents:/i);
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageWithFiles.test("should display file uploads", async ({ canvas }) => {
    await waitFor(() => {
        const document1File = canvas.getByText(/document1\.pdf/i);
        const document2File = canvas.getByText(/document2\.pdf/i);
        expect(document1File).toBeInTheDocument();
        expect(document2File).toBeInTheDocument();
    });
});

UserMessageWithFiles.test(
    "should not show update button when message has files",
    async ({ canvas }) => {
        await waitFor(() => {
            const updateButton = canvas.queryByRole("button", {
                name: /update/i,
            });
            expect(updateButton).not.toBeInTheDocument();
        });
    },
);

export const UserMessageWithImages = meta.story({
    args: {
        message: MOCK_USER_MESSAGE_WITH_MULTIPLE_IMAGES,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

UserMessageWithImages.test(
    "should render user message with image uploads",
    ({ canvas }) => {
        const article = canvas.getByRole("article");
        expect(article).toBeInTheDocument();
        expect(article).toHaveAttribute("data-role", "user");

        const messageText = canvas.getByText(/here are some images:/i);
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageWithImages.test(
    "should not show update button when message has images",
    async ({ canvas }) => {
        await waitFor(() => {
            const updateButton = canvas.queryByRole("button", {
                name: /update/i,
            });
            expect(updateButton).not.toBeInTheDocument();
        });
    },
);

export const UserMessageWithSingleFile = meta.story({
    args: {
        message: MOCK_USER_MESSAGE_WITH_SINGLE_FILE,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const UserMessageWithSingleImage = meta.story({
    args: {
        message: MOCK_USER_MESSAGE_WITH_SINGLE_IMAGE,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const UserMessageWithMultipleFiles = meta.story({
    args: {
        message: createMockUserMessageWithFiles({
            text: "Here are multiple documents:",
            files: createMockFileMessageParts(10, "document", "pdf"),
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const UserMessageWithMultipleImages = meta.story({
    args: {
        message: createMockUserMessageWithFiles({
            text: "Here are multiple images:",
            files: createMockImageMessageParts(10, "photo", "jpg"),
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const UserMessageWithFilesAndImages = meta.story({
    args: {
        message: createMockUserMessageWithFiles({
            text: "Here are some files and images:",
            files: MOCK_FILE_AND_IMAGE_PARTS,
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

UserMessageWithFilesAndImages.test(
    "should render user message with files and images",
    async ({ canvas }) => {
        const article = canvas.getByRole("article");
        expect(article).toBeInTheDocument();
        expect(article).toHaveAttribute("data-role", "user");

        const messageText = canvas.getByText(
            /here are some files and images:/i,
        );
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageWithFilesAndImages.test(
    "should display both files and images",
    async ({ canvas }) => {
        await waitFor(() => {
            const document1File = canvas.getByText(/document1\.pdf/i);
            const document2File = canvas.getByText(/document2\.pdf/i);
            expect(document1File).toBeInTheDocument();
            expect(document2File).toBeInTheDocument();
        });
    },
);

export const UserMessageUpdating = meta.story({
    args: {
        message: createMockUserMessage({
            text: "Original message text",
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

UserMessageUpdating.test(
    "should show prompt composer when updating message",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
            expect(textarea).toHaveValue("Original message text");
        });
    },
);

UserMessageUpdating.test(
    "should allow typing in the prompt composer",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        const textarea = await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
            return textarea;
        });

        await userEvent.clear(textarea);
        await userEvent.type(textarea, "Updated message text");

        expect(textarea).toHaveValue("Updated message text");
    },
);

UserMessageUpdating.test(
    "should cancel update and return to message view",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
        });

        const cancelButton = canvas.getByRole("button", { name: /cancel/i });
        await userEvent.click(cancelButton);

        await waitFor(() => {
            const textarea = canvas.queryByRole("textbox");
            expect(textarea).not.toBeInTheDocument();
        });

        const messageText = canvas.getByText(/original message text/i);
        expect(messageText).toBeInTheDocument();
    },
);

UserMessageUpdating.test(
    "should update message when update button is clicked",
    async ({ canvas, userEvent }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        const textarea = await waitFor(() => {
            const textarea = canvas.getByRole("textbox");
            expect(textarea).toBeInTheDocument();
            return textarea;
        });

        await userEvent.clear(textarea);
        await userEvent.type(textarea, "This is the updated message");

        const submitUpdateButton = canvas.getByRole("button", {
            name: /update/i,
        });
        await userEvent.click(submitUpdateButton);

        await waitFor(() => {
            const textareaAfterSubmit = canvas.queryByRole("textbox");
            expect(textareaAfterSubmit).not.toBeInTheDocument();
        });
    },
);

export const AssistantMessage = meta.story({
    args: {
        message: createMockAssistantMessage({
            text: "Hello! I'm here to help you. How can I assist you today?",
        }),
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

AssistantMessage.test("should render assistant message", async ({ canvas }) => {
    const article = canvas.getByRole("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveAttribute("data-role", "assistant");
});

AssistantMessage.test(
    "should display assistant message text",
    async ({ canvas }) => {
        const messageText = canvas.getByText(
            /hello! i'm here to help you\. how can i assist you today\?/i,
        );
        expect(messageText).toBeInTheDocument();
    },
);

AssistantMessage.test(
    "should show action buttons for assistant message when ready",
    async ({ canvas }) => {
        await waitFor(() => {
            const copyButton = canvas.getByRole("button", { name: /copy/i });
            const regenerateButton = canvas.getByRole("button", {
                name: /try again/i,
            });
            const upvoteButton = canvas.getByRole("button", {
                name: /upvote/i,
            });
            const downvoteButton = canvas.getByRole("button", {
                name: /downvote/i,
            });
            expect(copyButton).toBeInTheDocument();
            expect(regenerateButton).toBeInTheDocument();
            expect(upvoteButton).toBeInTheDocument();
            expect(downvoteButton).toBeInTheDocument();
        });
    },
);

export const AssistantMessageWithMarkdown = meta.story({
    args: {
        message: MOCK_ASSISTANT_MESSAGE_WITH_MARKDOWN,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const AssistantMessageWithWeatherTool = meta.story({
    args: {
        message: MOCK_ASSISTANT_MESSAGE_WITH_WEATHER,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const AssistantMessageWithGenerateImageTool = meta.story({
    args: {
        message: MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

export const AssistantMessageWithGenerateFileTool = meta.story({
    args: {
        message: MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE,
        chatId: MOCK_CHAT_ID,
        status: MOCK_CHAT_STATUS.READY,
    },
});

AssistantMessageWithGenerateFileTool.test(
    "should display generated file",
    async ({ canvas }) => {
        await waitFor(() => {
            const file = canvas.getByText(/generated-script\.py/i);
            expect(file).toBeInTheDocument();
        });
    },
);

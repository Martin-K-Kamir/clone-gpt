import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CONVERSATION_COMPLEX,
    MOCK_CONVERSATION_MULTIPLE,
    MOCK_CONVERSATION_SIMPLE,
    MOCK_CONVERSATION_WITH_GENERATED_FILE,
    MOCK_CONVERSATION_WITH_GENERATED_FILES,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGES,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE_LANDSCAPE,
    MOCK_CONVERSATION_WITH_GENERATED_IMAGE_PORTRAIT,
    MOCK_CONVERSATION_WITH_IMAGE_ANALYSIS,
    MOCK_CONVERSATION_WITH_LONG_MESSAGES,
    MOCK_CONVERSATION_WITH_MARKDOWN,
    MOCK_CONVERSATION_WITH_MULTIPLE_FILES,
    MOCK_CONVERSATION_WITH_MULTIPLE_IMAGES,
    MOCK_CONVERSATION_WITH_SINGLE_FILE,
    MOCK_CONVERSATION_WITH_SINGLE_IMAGE,
    MOCK_CONVERSATION_WITH_WEATHER,
} from "#.storybook/lib/mocks/conversations";
import {
    MOCK_CHAT_STATUS,
    createMockAssistantMessageWithTool,
    createMockUserMessage,
} from "#.storybook/lib/mocks/messages";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { CHAT_TOOL } from "@/features/chat/lib/constants";

import { ChatMessages } from "./chat-messages";

const meta = preview.meta({
    component: ChatMessages,
    decorators: [
        (Story, { parameters }) => {
            return (
                <AppProviders {...parameters.provider}>
                    <div className="h-screen w-full bg-zinc-950">
                        <Story />
                    </div>
                </AppProviders>
            );
        },
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

export const Default = meta.story({
    parameters: {
        provider: {
            messages: [],
        },
    },
});

export const WithMessages = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_SIMPLE,
        },
    },
});

WithMessages.test(
    "should display user and assistant messages",
    async ({ canvas }) => {
        const userMessage = canvas.getByText(/hello, how can you help me\?/i);
        const assistantMessage = canvas.getByText(
            /hello! i'm here to help you\./i,
        );

        expect(userMessage).toBeInTheDocument();
        expect(assistantMessage).toBeInTheDocument();
    },
);

WithMessages.test(
    "should render messages in correct order",
    async ({ canvas }) => {
        const articles = canvas.getAllByRole("article");
        expect(articles.length).toBe(2);
        expect(articles[0]).toHaveAttribute("data-role", "user");
        expect(articles[1]).toHaveAttribute("data-role", "assistant");
    },
);

export const WithMultipleMessages = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_MULTIPLE,
        },
    },
});

WithMultipleMessages.test("should render all messages", async ({ canvas }) => {
    const articles = canvas.getAllByRole("article");
    expect(articles.length).toBe(6);
});

export const WithLongConversation = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_LONG_MESSAGES,
        },
    },
});

WithLongConversation.test("should render all messages", async ({ canvas }) => {
    await waitFor(() => {
        const articles = canvas.getAllByRole("article");
        expect(articles.length).toBe(4);
    });
});

WithLongConversation.test(
    "should scroll to bottom on first render",
    async () => {
        // Find the scrollable container
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for auto-scroll to complete
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10; // Allow small margin for rounding

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );
    },
);

WithLongConversation.test(
    "should show scroll bottom button when scrolled up",
    async ({ canvas }) => {
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for initial scroll to bottom
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Scroll up
        scrollContainer.scrollTop = 0;

        // Wait for scroll event to process
        await waitFor(() => {
            const scrollButton = canvas.getByRole("button", {
                name: /scroll to bottom/i,
            });
            expect(scrollButton).toBeInTheDocument();
            expect(scrollButton).toBeVisible();
        });
    },
);

WithLongConversation.test(
    "should scroll to bottom when scroll bottom button is clicked",
    async ({ canvas, userEvent }) => {
        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        ) as HTMLElement;

        expect(scrollContainer).toBeInTheDocument();

        // Wait for initial scroll to bottom
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Scroll up
        scrollContainer.scrollTop = 0;

        // Wait for scroll button to appear and be clickable
        // The button has pointer-events-none when isAtBottom is true
        // We need to wait for useScrollPosition to update
        const scrollButton = await waitFor(
            () => {
                const button = canvas.getByRole("button", {
                    name: /scroll to bottom/i,
                });
                expect(button).toBeInTheDocument();
                expect(button).toBeEnabled();

                // Check that pointer-events is not 'none'
                const computedStyle = window.getComputedStyle(button);
                expect(computedStyle.pointerEvents).not.toBe("none");
                expect(computedStyle.opacity).not.toBe("0");

                return button;
            },
            { timeout: 2000 },
        );

        // Click the scroll bottom button
        await userEvent.click(scrollButton);

        // Wait for smooth scroll to complete
        await waitFor(
            () => {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                const isAtBottom =
                    Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

                expect(isAtBottom).toBe(true);
            },
            { timeout: 2000 },
        );

        // Button should be hidden again
        await waitFor(() => {
            const scrollButtonAfter = canvas.queryByRole("button", {
                name: /scroll to bottom/i,
            });
            // Button might still be in DOM but hidden with opacity-0
            if (scrollButtonAfter) {
                const computedStyle =
                    window.getComputedStyle(scrollButtonAfter);
                expect(computedStyle.opacity).toBe("0");
            }
        });
    },
);

export const UserWithSingleImage = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_SINGLE_IMAGE,
        },
    },
});

export const UserWithSingleFile = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_SINGLE_FILE,
        },
    },
});

export const UserWithMultipleImages = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_MULTIPLE_IMAGES,
        },
    },
});

export const UserWithMultipleFiles = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_MULTIPLE_FILES,
        },
    },
});

export const AssistantWithWeather = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_WEATHER,
        },
    },
});

export const AssistantWithGeneratedImage = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_GENERATED_IMAGE,
        },
    },
});

export const AssistantWithGeneratedImagePortrait = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_GENERATED_IMAGE_PORTRAIT,
        },
    },
});

export const AssistantWithGeneratedImageLandscape = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_GENERATED_IMAGE_LANDSCAPE,
        },
    },
});

export const AssistantWithGeneratedImages = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_GENERATED_IMAGES,
        },
    },
});

export const AssistantWithGeneratedFile = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_GENERATED_FILE,
        },
    },
});

export const AssistantWithGeneratedFiles = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_GENERATED_FILES,
        },
    },
});

export const AssistantWithMarkdown = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_MARKDOWN,
        },
    },
});

export const UserUploadWithAssistantResponse = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_WITH_IMAGE_ANALYSIS,
        },
    },
});

export const WithError = meta.story({
    parameters: {
        provider: {
            messages: [
                createMockUserMessage({ text: "This will cause an error" }),
            ],
            status: MOCK_CHAT_STATUS.ERROR,
            error: new Error("Failed to process request"),
        },
    },
});

WithError.test("should show error message", async ({ canvas }) => {
    const errorMessage = canvas.getByText(
        /something went wrong\. please try again\./i,
    );
    expect(errorMessage).toBeInTheDocument();
});

export const WithLoading = meta.story({
    parameters: {
        provider: {
            messages: [
                createMockUserMessage({
                    text: "What's the weather in New York?",
                }),
                createMockAssistantMessageWithTool(CHAT_TOOL.GET_WEATHER),
            ],
            status: MOCK_CHAT_STATUS.STREAMING,
        },
    },
});

WithLoading.test(
    "should show loader with tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const loader = canvas.getByRole("status", { hidden: true });
            expect(loader).toBeInTheDocument();
        });

        await waitFor(() => {
            const toolDescription = canvas.getByText(
                /getting the weather\.\.\./i,
            );
            expect(toolDescription).toBeInTheDocument();
        });
    },
);

export const ComplexConversation = meta.story({
    parameters: {
        provider: {
            messages: MOCK_CONVERSATION_COMPLEX,
        },
    },
});

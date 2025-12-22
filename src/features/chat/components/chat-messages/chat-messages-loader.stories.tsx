import preview from "#.storybook/preview";
import { ChatStatus } from "ai";
import { expect, waitFor } from "storybook/test";

import { CHAT_MESSAGE_TYPE, CHAT_ROLE } from "@/features/chat/lib/constants";
import type {
    DBChatMessageId,
    UIAssistantChatMessage,
    UIChatMessage,
} from "@/features/chat/lib/types";

import { ChatMessagesLoader } from "./chat-messages-loader";

const mockAssistantMessageId =
    "00000000-0000-0000-0000-000000000003" as DBChatMessageId;
const FIXED_MESSAGE_DATE = "2024-01-15T12:00:00.000Z";

function createMockAssistantMessageWithTool(
    toolType: string,
    messageId: DBChatMessageId = mockAssistantMessageId,
): UIAssistantChatMessage {
    return {
        id: messageId,
        role: CHAT_ROLE.ASSISTANT,
        metadata: {
            role: CHAT_ROLE.ASSISTANT,
            createdAt: FIXED_MESSAGE_DATE,
            model: "gpt-4",
            totalTokens: 100,
            isUpvoted: false,
            isDownvoted: false,
        },
        parts: [
            {
                type: toolType,
                toolCallId: `${toolType}-1`,
                state: "input-streaming",
                input: {},
                output: undefined,
            },
        ],
    } as UIAssistantChatMessage;
}

const meta = preview.meta({
    component: ChatMessagesLoader,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {
        status: "streaming" as ChatStatus,
        messages: [],
    },
});

Default.test("should render loader", async ({ canvas }) => {
    await waitFor(() => {
        const loader = canvas.getByRole("status", { hidden: true });
        expect(loader).toBeInTheDocument();
    });
});

export const WithWeatherTool = meta.story({
    args: {
        status: "streaming" as ChatStatus,
        messages: [
            createMockAssistantMessageWithTool("tool-getWeather"),
        ] as UIChatMessage[],
    },
});

WithWeatherTool.test(
    "should show weather tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const paragraph = canvas.getByRole("paragraph");
            expect(paragraph).toBeInTheDocument();
        });
    },
);

export const WithGenerateImageTool = meta.story({
    args: {
        status: "streaming" as ChatStatus,
        messages: [
            createMockAssistantMessageWithTool("tool-generateImage"),
        ] as UIChatMessage[],
    },
});

WithGenerateImageTool.test(
    "should show generate image tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const paragraph = canvas.getByRole("paragraph");
            expect(paragraph).toBeInTheDocument();
        });
    },
);

export const WithGenerateFileTool = meta.story({
    args: {
        status: "streaming" as ChatStatus,
        messages: [
            createMockAssistantMessageWithTool("tool-generateFile"),
        ] as UIChatMessage[],
    },
});

WithGenerateFileTool.test(
    "should show generate file tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const paragraph = canvas.getByRole("paragraph");
            expect(paragraph).toBeInTheDocument();
        });
    },
);

export const WithWebSearchTool = meta.story({
    args: {
        status: "streaming" as ChatStatus,
        messages: [
            createMockAssistantMessageWithTool("tool-webSearch"),
        ] as UIChatMessage[],
    },
});

WithWebSearchTool.test(
    "should show web search tool description",
    async ({ canvas }) => {
        await waitFor(() => {
            const paragraph = canvas.getByRole("paragraph");
            expect(paragraph).toBeInTheDocument();
        });
    },
);

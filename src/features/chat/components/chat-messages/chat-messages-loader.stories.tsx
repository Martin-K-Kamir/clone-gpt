import {
    MOCK_CHAT_STATUS,
    createMockAssistantMessageWithTool,
} from "#.storybook/lib/mocks/messages";
import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { CHAT_TOOL } from "@/features/chat/lib/constants";

import { ChatMessagesLoader } from "./chat-messages-loader";

const meta = preview.meta({
    component: ChatMessagesLoader,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.STREAMING,
        messages: [],
    },
});

Default.test("should render loader", async ({ canvas }) => {
    const loader = canvas.getByRole("status", { hidden: true });
    expect(loader).toBeInTheDocument();
});

export const WithWeatherTool = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.STREAMING,
        messages: [createMockAssistantMessageWithTool(CHAT_TOOL.GET_WEATHER)],
    },
});

WithWeatherTool.test(
    "should show weather tool description",
    async ({ canvas }) => {
        const paragraph = canvas.getByRole("paragraph");
        expect(paragraph).toBeInTheDocument();
    },
);

export const WithGenerateImageTool = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.STREAMING,
        messages: [
            createMockAssistantMessageWithTool(CHAT_TOOL.GENERATE_IMAGE),
        ],
    },
});

WithGenerateImageTool.test(
    "should show generate image tool description",
    async ({ canvas }) => {
        const paragraph = canvas.getByRole("paragraph");
        expect(paragraph).toBeInTheDocument();
    },
);

export const WithGenerateFileTool = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.STREAMING,
        messages: [createMockAssistantMessageWithTool(CHAT_TOOL.GENERATE_FILE)],
    },
});

WithGenerateFileTool.test(
    "should show generate file tool description",
    async ({ canvas }) => {
        const paragraph = canvas.getByRole("paragraph");
        expect(paragraph).toBeInTheDocument();
    },
);

export const WithWebSearchTool = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.STREAMING,
        messages: [createMockAssistantMessageWithTool(CHAT_TOOL.WEB_SEARCH)],
    },
});

WithWebSearchTool.test(
    "should show web search tool description",
    async ({ canvas }) => {
        const paragraph = canvas.getByRole("paragraph");
        expect(paragraph).toBeInTheDocument();
    },
);

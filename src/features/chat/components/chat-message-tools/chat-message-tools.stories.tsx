import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_TOOL_PARTS_GENERATE_FILE,
    MOCK_TOOL_PARTS_GENERATE_IMAGE,
    MOCK_TOOL_PARTS_WEATHER,
} from "#.storybook/lib/mocks/messages";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { ChatMessageTools } from "./chat-message-tools";

const meta = preview.meta({
    component: ChatMessageTools,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
        ),
    ],
    args: {
        parts: [],
    },
    argTypes: {
        parts: {
            control: false,
            description: "The message parts containing tool outputs",
        },
    },
});

export const Default = meta.story({});

Default.test("should render nothing when no tool parts", async ({ canvas }) => {
    const tools = canvas.queryByTestId("chat-message-tools");
    expect(tools?.children.length).toBe(0);
});

export const WithWeatherTool = meta.story({
    args: {
        parts: MOCK_TOOL_PARTS_WEATHER,
    },
    parameters: {
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

WithWeatherTool.test("should render weather component", async ({ canvas }) => {
    const weatherComponent = await waitFor(() =>
        canvas.getByTestId("weather-container"),
    );
    expect(weatherComponent).toBeInTheDocument();
});

export const WithGenerateImageTool = meta.story({
    args: {
        parts: MOCK_TOOL_PARTS_GENERATE_IMAGE,
    },
});

WithGenerateImageTool.test("should render image", async ({ canvas }) => {
    const images = await waitFor(() => canvas.getAllByRole("img"));
    expect(images.length).toBeGreaterThan(0);
});

export const WithGenerateFileTool = meta.story({
    args: {
        parts: MOCK_TOOL_PARTS_GENERATE_FILE,
    },
    parameters: {
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

WithGenerateFileTool.test("should render file banner", async ({ canvas }) => {
    const file = await waitFor(() => canvas.getByText(/generated-script\.py/i));
    expect(file).toBeInTheDocument();
});

import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_COPY,
    MOCK_CHAT_BUTTON_UPDATE,
    MOCK_CHAT_MESSAGE_HERE_ARE_DOCUMENTS_SHORT,
    MOCK_CHAT_MESSAGE_HERE_ARE_PHOTOS,
    MOCK_CHAT_MESSAGE_SAMPLE_USER,
} from "#.storybook/lib/mocks/chat";
import {
    MOCK_CHAT_STATUS,
    MOCK_FILE_PARTS_MULTIPLE,
    MOCK_IMAGE_PARTS_MULTIPLE,
    createMockTextMessagePart,
} from "#.storybook/lib/mocks/messages";
import { createMockMessagesRateLimit } from "#.storybook/lib/mocks/rate-limits";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { ChatMessageToolbarUser } from "./chat-message-toolbar-user";

const meta = preview.meta({
    component: ChatMessageToolbarUser,
    decorators: [
        (Story, { parameters }) => {
            return (
                <AppProviders {...parameters.provider}>
                    <div className="group/message flex min-h-[200px] items-center justify-center bg-zinc-950 p-8">
                        <Story />
                    </div>
                </AppProviders>
            );
        },
    ],
    args: {
        canShowActions: true,
        status: MOCK_CHAT_STATUS.READY,
        content: MOCK_CHAT_MESSAGE_SAMPLE_USER,
        parts: [createMockTextMessagePart(MOCK_CHAT_MESSAGE_SAMPLE_USER)],
        onUpdate: fn(),
        className: "opacity-100",
    },
    argTypes: {
        canShowActions: {
            control: "boolean",
            description: "Whether to show the toolbar",
        },
        status: {
            control: "select",
            options: [
                MOCK_CHAT_STATUS.READY,
                MOCK_CHAT_STATUS.STREAMING,
                MOCK_CHAT_STATUS.SUBMITTED,
                MOCK_CHAT_STATUS.ERROR,
            ],
            description: "The chat status",
        },
        content: {
            control: "text",
            description: "The message content",
        },
        parts: {
            control: false,
            description: "The message parts",
        },
        onUpdate: {
            control: false,
            description:
                "Callback function called when update button is clicked",
        },
        className: {
            control: "text",
            description: "The class name for the toolbar",
        },
    },
});

export const Default = meta.story({});

Default.test(
    "should render toolbar with copy and update buttons",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const updateButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).toBeInTheDocument();
    },
);

Default.test(
    "should call onUpdate when update button is clicked",
    async ({ canvas, userEvent, args }) => {
        const updateButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });
        await userEvent.click(updateButton);

        expect(args.onUpdate).toHaveBeenCalledTimes(1);
    },
);

export const WithFiles = meta.story({
    args: {
        parts: [
            createMockTextMessagePart(
                MOCK_CHAT_MESSAGE_HERE_ARE_DOCUMENTS_SHORT,
            ),
            ...MOCK_FILE_PARTS_MULTIPLE,
        ],
    },
});

WithFiles.test(
    "should not show update button when message has files",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const updateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);
export const WithImages = meta.story({
    args: {
        parts: [
            createMockTextMessagePart(MOCK_CHAT_MESSAGE_HERE_ARE_PHOTOS),
            ...MOCK_IMAGE_PARTS_MULTIPLE,
        ],
    },
});

WithImages.test(
    "should not show update button when message has images",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const updateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const Streaming = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.STREAMING,
    },
});

Streaming.test("should disable actions when streaming", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
    });
    const updateButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
    });

    expect(copyButton).toBeDisabled();
    expect(updateButton).toBeDisabled();
});

export const Submitted = meta.story({
    args: {
        status: MOCK_CHAT_STATUS.SUBMITTED,
    },
});

Submitted.test("should disable actions when submitted", async ({ canvas }) => {
    const copyButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
    });
    const updateButton = canvas.getByRole("button", {
        name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
    });

    expect(copyButton).toBeDisabled();
    expect(updateButton).toBeDisabled();
});

export const NotOwner = meta.story({
    parameters: {
        provider: {
            isOwner: false,
        },
    },
});

NotOwner.test(
    "should not show update button when user is not owner",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const updateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const RateLimitExceeded = meta.story({
    parameters: {
        provider: {
            rateLimit: createMockMessagesRateLimit({
                tokensCounter: 1000,
                messagesCounter: 100,
            }),
        },
        chromatic: { disableSnapshot: true },
    },
});

RateLimitExceeded.test(
    "should not show update button when rate limit is exceeded",
    async ({ canvas }) => {
        const copyButton = canvas.getByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const updateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });

        expect(copyButton).toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const Hidden = meta.story({
    args: {
        canShowActions: false,
    },
});

Hidden.test(
    "should not render when canShowActions is false",
    async ({ canvas }) => {
        const copyButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_COPY, "i"),
        });
        const updateButton = canvas.queryByRole("button", {
            name: new RegExp(MOCK_CHAT_BUTTON_UPDATE, "i"),
        });

        expect(copyButton).not.toBeInTheDocument();
        expect(updateButton).not.toBeInTheDocument();
    },
);

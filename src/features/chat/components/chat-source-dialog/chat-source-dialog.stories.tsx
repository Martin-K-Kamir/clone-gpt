import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_ADDITIONAL_SOURCE_PARTS,
    MOCK_ADDITIONAL_SOURCE_PREVIEWS,
    MOCK_SOURCE_PARTS,
    MOCK_SOURCE_PREVIEWS,
    MOCK_SOURCE_SINGLE_PREVIEW,
    createMockTextMessagePart,
} from "#.storybook/lib/mocks/messages";
import { waitForElement } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { HttpResponse, http } from "msw";
import { expect } from "storybook/test";

import { ChatSourceDialog } from "./chat-source-dialog";

const meta = preview.meta({
    component: ChatSourceDialog,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="p-4">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
    argTypes: {
        parts: {
            control: "object",
            description: "Array of message parts from assistant message",
        },
        disabled: {
            control: "boolean",
            description: "Whether the trigger button is disabled",
        },
        classNameTrigger: {
            control: "text",
            description: "Additional CSS class for the trigger button",
        },
        triggerRef: {
            control: false,
            description: "Ref for the trigger button",
        },
    },
});

export const Default = meta.story({
    args: {
        parts: MOCK_SOURCE_PARTS,
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json(MOCK_SOURCE_PREVIEWS);
                }),
            ],
        },
    },
});

Default.test("should render sources button", async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button).toBeInTheDocument();
});

Default.test("should show source icons", async ({ canvas }) => {
    const images = canvas.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
});

Default.test(
    "should open dialog when button is clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        const dialog = await waitForElement('[data-slot="dialog-content"]');
        expect(dialog).toBeInTheDocument();
    },
);

export const WithSingleSource = meta.story({
    args: {
        parts: [MOCK_SOURCE_PARTS[0]],
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json([MOCK_SOURCE_SINGLE_PREVIEW]);
                }),
            ],
        },
    },
});

WithSingleSource.test(
    "should show single source in dialog",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        const dialog = await waitForElement('[data-slot="dialog-content"]');
        expect(dialog).toBeInTheDocument();
    },
);

export const WithManySources = meta.story({
    args: {
        parts: [...MOCK_SOURCE_PARTS, ...MOCK_ADDITIONAL_SOURCE_PARTS],
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json([
                        ...MOCK_SOURCE_PREVIEWS,
                        ...MOCK_ADDITIONAL_SOURCE_PREVIEWS,
                    ]);
                }),
            ],
        },
    },
});

WithManySources.test(
    "should show all sources in dialog",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        const dialog = await waitForElement('[data-slot="dialog-content"]');
        expect(dialog).toBeInTheDocument();

        const items = dialog.querySelectorAll("li");
        expect(items.length).toBeGreaterThan(0);
    },
);

export const WithMixedParts = meta.story({
    args: {
        parts: [
            createMockTextMessagePart("Here are some sources:"),
            ...MOCK_SOURCE_PARTS,
            createMockTextMessagePart("More information available."),
        ],
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json(MOCK_SOURCE_PREVIEWS);
                }),
            ],
        },
    },
});

WithMixedParts.test(
    "should filter only source-url parts",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        const dialog = await waitForElement('[data-slot="dialog-content"]');
        expect(dialog).toBeInTheDocument();

        const items = dialog.querySelectorAll("li");
        expect(items.length).toBeGreaterThan(0);
    },
);

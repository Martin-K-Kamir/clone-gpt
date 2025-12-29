import { AppProviders } from "#.storybook/lib/decorators/providers";
import preview from "#.storybook/preview";
import type React from "react";
import { expect } from "storybook/test";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { ChatComposerFooter } from "./chat-composer-footer";

const meta = preview.meta({
    component: ChatComposerFooter,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="bg-zinc-925 relative min-h-[200px] w-full">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    parameters: {
        provider: {
            isOwner: false,
            visibility: CHAT_VISIBILITY.PUBLIC,
        },
    },
});

Default.test("should render footer", async ({ canvas }) => {
    const footer = canvas.getByTestId("chat-composer-footer");
    expect(footer).toBeInTheDocument();
});

Default.test("should render public notice", async ({ canvas }) => {
    const publicNotice = canvas.getByTestId("chat-composer-public-notice");
    expect(publicNotice).toBeInTheDocument();
});

export const WithoutPublicNotice = meta.story({
    parameters: {
        provider: {
            isOwner: true,
            visibility: CHAT_VISIBILITY.PRIVATE,
        },
    },
});

WithoutPublicNotice.test("should render footer", async ({ canvas }) => {
    const footer = canvas.getByTestId("chat-composer-footer");
    expect(footer).toBeInTheDocument();
});

WithoutPublicNotice.test(
    "should not render public notice",
    async ({ canvas }) => {
        const publicNotice = canvas.queryByTestId(
            "chat-composer-public-notice",
        );
        expect(publicNotice).not.toBeInTheDocument();
    },
);

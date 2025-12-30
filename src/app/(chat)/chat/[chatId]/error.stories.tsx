import { QueryProvider } from "#.storybook/lib/decorators/providers";
import {
    MOCK_APP_ERROR_CHAT_NOT_FOUND,
    MOCK_APP_LINK_START_NEW_CHAT,
    MOCK_APP_ROUTE_HOME,
} from "#.storybook/lib/mocks/app";
import { clickLinkAndVerify } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import Error from "./error";

const meta = preview.meta({
    component: Error,
    decorators: [
        (Story, { parameters }) => (
            <QueryProvider {...parameters.provider}>
                <SidebarProvider>
                    <Story />
                </SidebarProvider>
            </QueryProvider>
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

export const Default = meta.story();

Default.test("should render heading and description", async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
        level: 2,
        name: new RegExp(MOCK_APP_ERROR_CHAT_NOT_FOUND, "i"),
    });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent.length).toBeGreaterThan(0);

    const description = canvas.getByRole("paragraph");
    expect(description).toBeInTheDocument();
    expect(description.textContent.length).toBeGreaterThan(0);
});

Default.test(
    "should render start a new chat link",
    async ({ canvas, userEvent }) => {
        const link = canvas.getByRole("link", {
            name: new RegExp(MOCK_APP_LINK_START_NEW_CHAT, "i"),
        });

        expect(link).toBeInTheDocument();
        expect(link).toBeEnabled();

        await clickLinkAndVerify(link, userEvent, MOCK_APP_ROUTE_HOME);
    },
);

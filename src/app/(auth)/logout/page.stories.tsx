import { MOCK_APP_ROUTE_SIGNIN } from "#.storybook/lib/mocks/app";
import { clickLinkAndVerify } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import Page from "./page";

const meta = preview.meta({
    component: Page,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story();

Default.test("should render heading and description", async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
        level: 1,
    });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent.length).toBeGreaterThan(0);

    const description = canvas.getByRole("paragraph");
    expect(description).toBeInTheDocument();
    expect(description.textContent.length).toBeGreaterThan(0);
});

Default.test("should render log in button", async ({ canvas, userEvent }) => {
    const button = canvas.getByRole("link");

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    await clickLinkAndVerify(button, userEvent, MOCK_APP_ROUTE_SIGNIN);
});

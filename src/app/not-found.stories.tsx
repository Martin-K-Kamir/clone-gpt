import {
    MOCK_APP_BUTTON_GO_TO_HOME,
    MOCK_APP_ERROR_404_NOT_FOUND,
    MOCK_APP_ROUTE_HOME,
} from "#.storybook/lib/mocks/app";
import { clickLinkAndVerify } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import NotFound from "./not-found";

const meta = preview.meta({
    component: NotFound,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {},
});

Default.test("should render heading and description", async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
        level: 1,
        name: MOCK_APP_ERROR_404_NOT_FOUND,
    });
    expect(heading).toBeInTheDocument();

    const description = canvas.getByRole("paragraph");
    expect(description).toBeInTheDocument();
    expect(description.textContent.length).toBeGreaterThan(0);
});

Default.test("should render go to home link", async ({ canvas, userEvent }) => {
    const link = canvas.getByRole("link", {
        name: new RegExp(MOCK_APP_BUTTON_GO_TO_HOME, "i"),
    });

    expect(link).toBeInTheDocument();
    expect(link).toBeEnabled();

    await clickLinkAndVerify(link, userEvent, MOCK_APP_ROUTE_HOME);
});

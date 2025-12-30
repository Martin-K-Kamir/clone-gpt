import { MOCK_APP_BUTTON_TRY_AGAIN } from "#.storybook/lib/mocks/app";
import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import Error from "./error";

const meta = preview.meta({
    component: Error,
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {
        reset: fn(),
    },
});

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

Default.test(
    "should call reset when try again button is clicked",
    async ({ canvas, userEvent, args }) => {
        const button = canvas.getByRole("button", {
            name: new RegExp(MOCK_APP_BUTTON_TRY_AGAIN, "i"),
        });

        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();

        await userEvent.click(button);

        expect(args.reset).toHaveBeenCalled();
    },
);

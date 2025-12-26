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
    });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent.length).toBeGreaterThan(0);

    const description = canvas.getByRole("paragraph");
    expect(description).toBeInTheDocument();
    expect(description.textContent.length).toBeGreaterThan(0);
});

Default.test("should render go to home link", async ({ canvas, userEvent }) => {
    const link = canvas.getByRole("link", {
        name: /go to home/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toBeEnabled();
    expect(link).toHaveAttribute("href", "/");

    let clicked = false;
    link.addEventListener("click", e => {
        e.preventDefault();
        clicked = true;
    });

    await userEvent.click(link);

    expect(clicked).toBe(true);
});

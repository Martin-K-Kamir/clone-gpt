import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import Error from "./error";

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    return (
        <SidebarProvider>
            <Story />
        </SidebarProvider>
    );
};

const meta = preview.meta({
    component: Error,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {},
});

Default.test("should render heading and description", async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
        level: 2,
        name: /chat not found/i,
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
            name: /start a new chat/i,
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
    },
);

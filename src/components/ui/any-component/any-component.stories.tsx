import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { AnyComponent } from "./any-component";

const meta = preview.meta({
    component: AnyComponent,
    args: {
        children: "AnyComponent",
    },
    argTypes: {
        as: {
            control: "select",
            description:
                "The HTML element or React component to render as. Defaults to 'div'.",
            options: [
                "div",
                "span",
                "button",
                "h1",
                "h2",
                "h3",
                "p",
                "section",
                "article",
                "nav",
                "header",
                "footer",
                "main",
                "aside",
            ],
            table: {
                type: {
                    summary: "ElementType | undefined",
                },
                defaultValue: {
                    summary: "div",
                },
            },
        },
        children: {
            control: "text",
            description: "The content to render inside the component",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        children: "This renders as a div by default",
    },
});

export const AsButton = meta.story({
    args: {
        as: "button",
        children: "Click me!",
        onClick: fn(),
        className:
            "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors",
    },
});

AsButton.test(
    "should call onClick when button is clicked",
    async ({ canvas, userEvent, args }) => {
        const button = canvas.getByRole("button");
        expect(button).toBeVisible();
        await userEvent.click(button);
        expect(args.onClick).toHaveBeenCalled();
    },
);

export const AsHeading = meta.story({
    render: () => (
        <div className="space-y-4">
            <AnyComponent as="h1" className="text-3xl font-bold">
                Heading 1
            </AnyComponent>
            <AnyComponent as="h2" className="text-2xl font-semibold">
                Heading 2
            </AnyComponent>
            <AnyComponent as="h3" className="text-xl font-medium">
                Heading 3
            </AnyComponent>
        </div>
    ),
});

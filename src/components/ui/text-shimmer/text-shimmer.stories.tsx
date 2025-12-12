import preview from "#.storybook/preview";

import { TextShimmer } from "./text-shimmer";

const meta = preview.meta({
    component: TextShimmer,
    tags: ["autodocs"],
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        children: {
            control: "text",
            description: "The text content to display with shimmer effect",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        classNameParagraph: {
            control: "text",
            description: "Additional CSS classes for the paragraph element",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the container",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        children: "Loading...",
    },
});

export const LongText = meta.story({
    name: "Long Text",
    args: {
        children: "Analyzing your request and preparing a detailed response...",
    },
});

export const CustomParagraphStyling = meta.story({
    name: "Custom Paragraph Styling",
    args: {
        children: "Custom styled text",
        classNameParagraph: "text-base font-bold",
    },
});

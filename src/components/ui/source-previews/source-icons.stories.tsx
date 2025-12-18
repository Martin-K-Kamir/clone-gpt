import preview from "#.storybook/preview";
import { type SourceUrlUIPart } from "ai";
import { expect } from "storybook/test";

import { SourceIcons } from "./source-icons";

const mockSources: SourceUrlUIPart[] = [
    {
        type: "source-url",
        sourceId: "source-1",
        url: "https://github.com/vercel/next.js",
        title: "Next.js - The React Framework",
    },
    {
        type: "source-url",
        sourceId: "source-2",
        url: "https://react.dev/reference/react",
        title: "React Reference Documentation",
    },
    {
        type: "source-url",
        sourceId: "source-3",
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS Documentation",
    },
    {
        type: "source-url",
        sourceId: "source-4",
        url: "https://www.typescriptlang.org/docs",
        title: "TypeScript Documentation",
    },
    {
        type: "source-url",
        sourceId: "source-5",
        url: "https://nodejs.org/docs",
        title: "Node.js Documentation",
    },
];

const meta = preview.meta({
    component: SourceIcons,
    args: {
        sources: mockSources,
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        sources: {
            control: "object",
            description: "Array of source URL parts from AI SDK",
            table: {
                type: {
                    summary: "SourceUrlUIPart[]",
                },
            },
        },
        limit: {
            control: "number",
            description: "Maximum number of icons to display",
            table: {
                type: {
                    summary: "number",
                },
                defaultValue: {
                    summary: "3",
                },
            },
        },
        classNameIcon: {
            control: "text",
            description: "Additional CSS class for individual icon styling",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS class for the container",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story();

Default.test("should render icons for each source", ({ canvas }) => {
    const images = canvas.getAllByRole("img");
    expect(images).toHaveLength(3);
});

Default.test("should have proper alt text from source titles", ({ canvas }) => {
    const images = canvas.getAllByRole("img");
    expect(images[0]).toHaveAttribute("alt", "Next.js - The React Framework");
    expect(images[1]).toHaveAttribute("alt", "React Reference Documentation");
    expect(images[2]).toHaveAttribute("alt", "Tailwind CSS Documentation");
});

export const WithLimit = meta.story({
    name: "With Custom Limit",
    args: {
        limit: 5,
    },
});

WithLimit.test("should render up to the specified limit", ({ canvas }) => {
    const images = canvas.getAllByRole("img");
    expect(images).toHaveLength(5);
});

export const Empty = meta.story({
    args: {
        sources: [],
    },
});

Empty.test("should render empty container", ({ canvas }) => {
    const images = canvas.queryAllByRole("img");
    expect(images).toHaveLength(0);
});

export const WithChildren = meta.story({
    name: "With Children",
    parameters: {
        a11y: {
            disable: true,
        },
    },
    args: {
        sources: mockSources.slice(0, 2),
        children: (
            <span className="ml-1 text-sm text-zinc-100">+3 more sources</span>
        ),
    },
});

WithChildren.test("should render children alongside icons", ({ canvas }) => {
    const text = canvas.getByText("+3 more sources");
    expect(text).toBeVisible();
});

export const InvalidUrls = meta.story({
    name: "With Invalid URLs",
    args: {
        sources: [
            {
                type: "source-url",
                sourceId: "source-invalid",
                url: "not-a-valid-url",
                title: "Invalid URL",
            },
            ...mockSources.slice(0, 2),
        ],
    },
});

InvalidUrls.test("should filter out invalid URLs", ({ canvas }) => {
    const images = canvas.getAllByRole("img");
    expect(images).toHaveLength(2);
});

export const ManySourcesLimited = meta.story({
    name: "Many Sources (Limited)",
    args: {
        sources: mockSources,
        limit: 3,
    },
});

ManySourcesLimited.test(
    "should only show limited number of icons",
    ({ canvas }) => {
        const images = canvas.getAllByRole("img");
        expect(images).toHaveLength(3);
    },
);

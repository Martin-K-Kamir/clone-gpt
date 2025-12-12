import preview from "#.storybook/preview";

import { Loader } from "./loader";

const meta = preview.meta({
    component: Loader,
    tags: ["autodocs"],

    parameters: {
        chromatic: {
            disableSnapshot: true,
        },
    },
    argTypes: {
        size: {
            control: "select",
            options: ["default", "sm", "lg"],
            description: "Size variant of the loader",
            table: {
                type: {
                    summary: '"default" | "sm" | "lg"',
                },
                defaultValue: {
                    summary: "default",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes",
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
        size: "default",
    },
});

export const Small = meta.story({
    args: {
        size: "sm",
    },
});

export const Large = meta.story({
    args: {
        size: "lg",
    },
});

export const InText = meta.story({
    render: () => (
        <div className="bg-zinc-925 space-y-4 rounded-2xl p-8">
            <div className="flex items-center gap-4 text-sm text-zinc-100">
                <Loader size="sm" />
                <span>Loading content...</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-100">
                <Loader size="default" />
                <span>Loading content...</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-100">
                <Loader size="lg" />
                <span className="text-lg">Loading content...</span>
            </div>
        </div>
    ),
});

export const AllSizes = meta.story({
    render: () => (
        <div className="bg-zinc-925 flex items-center justify-center gap-4 rounded-2xl p-8">
            <Loader size="sm" />
            <Loader size="default" />
            <Loader size="lg" />
        </div>
    ),
});

import preview from "#.storybook/preview";

import { Separator } from "./separator";

const meta = preview.meta({
    component: Separator,
    argTypes: {
        orientation: {
            control: "radio",
            options: ["horizontal", "vertical"],
            description: "The orientation of the separator",
            table: {
                type: { summary: '"horizontal" | "vertical"' },
                defaultValue: { summary: "horizontal" },
            },
        },
        decorative: {
            control: "boolean",
            description:
                "When true, signifies that it is purely visual and not meaningful",
            table: {
                type: { summary: "boolean" },
                defaultValue: { summary: "true" },
            },
        },
    },
});

export const Default = meta.story({
    render: args => (
        <div className="w-64">
            <Separator {...args} />
        </div>
    ),
});

export const Vertical = meta.story({
    args: {
        orientation: "vertical",
    },
    render: args => (
        <div className="bg-zinc-925 flex h-12 items-center rounded-lg p-4">
            <span className="text-sm text-zinc-100">Left</span>
            <Separator {...args} className="mx-3" />
            <span className="text-sm text-zinc-100">Right</span>
        </div>
    ),
});

export const WithContent = meta.story({
    render: args => (
        <div className="bg-zinc-925 w-64 space-y-3 rounded-lg p-4">
            <div className="text-sm text-zinc-100">Section One</div>
            <Separator {...args} />
            <div className="text-sm text-zinc-100">Section Two</div>
            <Separator {...args} />
            <div className="text-sm text-zinc-100">Section Three</div>
        </div>
    ),
});

export const CustomStyling = meta.story({
    args: {
        className: "bg-blue-500",
    },
    render: args => (
        <div className="w-64">
            <Separator {...args} />
        </div>
    ),
});

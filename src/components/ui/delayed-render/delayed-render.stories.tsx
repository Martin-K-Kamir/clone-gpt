import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { DelayedRender } from "./delayed-render";

type DelayedRenderStoryArgs = {
    children: React.ReactNode;
    delay?: number;
};

const meta = preview.meta({
    component: DelayedRender,
    args: {
        children: "This content will appear after 500ms",
        delay: 500,
    } as DelayedRenderStoryArgs,
    argTypes: {
        children: {
            control: "text",
            description: "The content to render after the delay",
            table: {
                type: {
                    summary: "React.ReactNode",
                },
            },
        },
        delay: {
            control: { type: "number", min: 0, max: 5000, step: 100 },
            description:
                "The delay in milliseconds before rendering the children",
            table: {
                type: {
                    summary: "number",
                },
                defaultValue: {
                    summary: "500",
                },
            },
        },
    } as Record<string, unknown>,
    render: args => {
        const { children, delay, ...props } = args as DelayedRenderStoryArgs &
            React.ComponentProps<typeof DelayedRender>;
        return (
            <DelayedRender delay={delay} {...props}>
                {children}
            </DelayedRender>
        );
    },
});

export const Default = meta.story({
    args: {
        children: "This content appears after 500ms (default delay)",
        delay: 500,
    } as DelayedRenderStoryArgs,
});

Default.test("should render content after delay", async ({ canvas, args }) => {
    const { delay = 500 } = args;
    const text = "This content appears after 500ms (default delay)";

    expect(canvas.queryByText(text)).not.toBeInTheDocument();

    await waitFor(
        () => {
            expect(canvas.getByText(text)).toBeVisible();
        },
        { timeout: delay + 100 },
    );
});

export const ShortDelay = meta.story({
    args: {
        children: "This content appears after 200ms",
        delay: 200,
    } as DelayedRenderStoryArgs,
});

ShortDelay.test(
    "should render content after short delay",
    async ({ canvas, args }) => {
        const { delay = 200 } = args;
        const text = "This content appears after 200ms";

        expect(canvas.queryByText(text)).not.toBeInTheDocument();

        await waitFor(
            () => {
                expect(canvas.getByText(text)).toBeVisible();
            },
            { timeout: delay + 100 },
        );
    },
);

export const LongDelay = meta.story({
    args: {
        children: "This content appears after 2000ms (2 seconds)",
        delay: 2000,
    } as DelayedRenderStoryArgs,
});

LongDelay.test(
    "should render content after long delay",
    async ({ canvas, args }) => {
        const { delay = 2000 } = args;
        const text = "This content appears after 2000ms (2 seconds)";

        expect(canvas.queryByText(text)).not.toBeInTheDocument();

        await waitFor(
            () => {
                expect(canvas.getByText(text)).toBeVisible();
            },
            { timeout: delay + 100 },
        );
    },
);

export const WithoutDelay = meta.story({
    args: {
        children: "This content appears immediately (0ms delay)",
        delay: 0,
    } as DelayedRenderStoryArgs,
});

WithoutDelay.test(
    "should render content immediately with no delay",
    async ({ canvas }) => {
        await waitFor(
            () => {
                expect(
                    canvas.getByText(
                        "This content appears immediately (0ms delay)",
                    ),
                ).toBeVisible();
            },
            { timeout: 100 },
        );
    },
);

export const MultipleDelayedRenders = meta.story({
    render: () => (
        <div className="space-y-4">
            <div>
                <p className="mb-2 text-sm text-gray-600">
                    First item (200ms delay):
                </p>
                <DelayedRender delay={200}>
                    <div className="rounded bg-green-100 p-3 text-green-800">
                        First item appeared!
                    </div>
                </DelayedRender>
            </div>
            <div>
                <p className="mb-2 text-sm text-gray-600">
                    Second item (500ms delay):
                </p>
                <DelayedRender delay={500}>
                    <div className="rounded bg-blue-100 p-3 text-blue-800">
                        Second item appeared!
                    </div>
                </DelayedRender>
            </div>
            <div>
                <p className="mb-2 text-sm text-gray-600">
                    Third item (1000ms delay):
                </p>
                <DelayedRender delay={1000}>
                    <div className="rounded bg-purple-100 p-3 text-purple-800">
                        Third item appeared!
                    </div>
                </DelayedRender>
            </div>
        </div>
    ),
});

MultipleDelayedRenders.test(
    "should render multiple items with different delays",
    async ({ canvas }) => {
        await waitFor(
            () => {
                expect(canvas.getByText("First item appeared!")).toBeVisible();
            },
            { timeout: 300 },
        );

        await waitFor(
            () => {
                expect(canvas.getByText("Second item appeared!")).toBeVisible();
            },
            { timeout: 600 },
        );

        await waitFor(
            () => {
                expect(canvas.getByText("Third item appeared!")).toBeVisible();
            },
            { timeout: 1100 },
        );
    },
);

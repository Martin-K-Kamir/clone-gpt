import {
    MOCK_DELAYS_MULTIPLE,
    MOCK_DELAY_DEFAULT,
    MOCK_DELAY_LONG,
    MOCK_DELAY_NONE,
    MOCK_DELAY_SHORT,
} from "#.storybook/lib/mocks/delayed-render";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { DelayedRender } from "./delayed-render";

const meta = preview.meta({
    component: DelayedRender,
    args: {
        children: "This content will appear after 500ms",
        delay: 500,
    },
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
    },
    render: args => {
        const { children, delay, ...props } = args;

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
        delay: MOCK_DELAY_DEFAULT,
    },
});

Default.test("should render content after delay", async ({ canvas, args }) => {
    const { delay = MOCK_DELAY_DEFAULT } = args;
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
        delay: MOCK_DELAY_SHORT,
    },
});

ShortDelay.test(
    "should render content after short delay",
    async ({ canvas, args }) => {
        const { delay = MOCK_DELAY_SHORT } = args;
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
        delay: MOCK_DELAY_LONG,
    },
});

LongDelay.test(
    "should render content after long delay",
    async ({ canvas, args }) => {
        const { delay = MOCK_DELAY_LONG } = args;
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
        delay: MOCK_DELAY_NONE,
    },
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
                <DelayedRender delay={MOCK_DELAYS_MULTIPLE.FIRST}>
                    <div className="rounded bg-green-100 p-3 text-green-800">
                        First item appeared!
                    </div>
                </DelayedRender>
            </div>
            <div>
                <p className="mb-2 text-sm text-gray-600">
                    Second item (500ms delay):
                </p>
                <DelayedRender delay={MOCK_DELAYS_MULTIPLE.SECOND}>
                    <div className="rounded bg-blue-100 p-3 text-blue-800">
                        Second item appeared!
                    </div>
                </DelayedRender>
            </div>
            <div>
                <p className="mb-2 text-sm text-gray-600">
                    Third item (1000ms delay):
                </p>
                <DelayedRender delay={MOCK_DELAYS_MULTIPLE.THIRD}>
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
            { timeout: MOCK_DELAYS_MULTIPLE.FIRST + 100 },
        );

        await waitFor(
            () => {
                expect(canvas.getByText("Second item appeared!")).toBeVisible();
            },
            { timeout: MOCK_DELAYS_MULTIPLE.SECOND + 100 },
        );

        await waitFor(
            () => {
                expect(canvas.getByText("Third item appeared!")).toBeVisible();
            },
            { timeout: MOCK_DELAYS_MULTIPLE.THIRD + 100 },
        );
    },
);

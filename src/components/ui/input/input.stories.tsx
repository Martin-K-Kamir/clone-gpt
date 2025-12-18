import preview from "#.storybook/preview";
import { expect, fn, waitFor } from "storybook/test";

import { Input } from "./input";

const meta = preview.meta({
    component: Input,
    render: args => (
        <>
            <label htmlFor="input" className="sr-only">
                Input
            </label>
            <Input {...args} id="input" />
        </>
    ),
    args: {
        placeholder: "Enter text...",
        onChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        type: {
            control: "select",
            description: "The type of input",
            options: [
                "text",
                "email",
                "password",
                "number",
                "tel",
                "url",
                "search",
                "date",
                "time",
                "datetime-local",
            ],
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "text",
                },
            },
        },
        placeholder: {
            control: "text",
            description: "Placeholder text for the input",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the input is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        isLoading: {
            control: "boolean",
            description: "Whether the input is in loading state",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        placeholderAnimation: {
            control: "boolean",
            description:
                "Whether to enable animated placeholder switching between multiple placeholders",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        placeholders: {
            control: "object",
            description:
                "Array of placeholder strings to animate through (requires placeholderAnimation: true)",
            table: {
                type: {
                    summary: "readonly string[]",
                },
            },
        },
        switchInterval: {
            control: "number",
            description:
                "Interval in milliseconds between placeholder switches (default: 6000)",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        switchDuration: {
            control: "number",
            description:
                "Duration of the placeholder animation transition in seconds (default: 0.35)",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        runAnimation: {
            control: "boolean",
            description: "Whether to run the placeholder animation",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        randomize: {
            control: "boolean",
            description:
                "Whether to randomize the order of placeholder switches",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        value: {
            control: "text",
            description: "The value of the input",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story();

Default.test("should be interactive", async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole("textbox");
    expect(input).toBeVisible();
    expect(input).toBeEnabled();

    await userEvent.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
    expect(args.onChange).toHaveBeenCalled();
});

export const Email = meta.story({
    args: {
        type: "email",
        placeholder: "Enter your email",
    },
});

Email.test("should accept email input", async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "user@example.com");
    expect(input).toHaveValue("user@example.com");
    expect(input).toHaveAttribute("type", "email");
});

export const Password = meta.story({
    args: {
        type: "password",
        placeholder: "Enter your password",
    },
});

Password.test("should mask password input", async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText(/password/i);
    await userEvent.type(input, "secret123");
    expect(input).toHaveAttribute("type", "password");
});

export const Number = meta.story({
    args: {
        type: "number",
        placeholder: "Enter a number",
    },
});

Number.test("should accept number input", async ({ canvas, userEvent }) => {
    const input = canvas.getByPlaceholderText(/number/i);
    await userEvent.type(input, "1234567890");
    expect(input).toHaveValue(1234567890);
    expect(input).toHaveAttribute("type", "number");
});

Number.test(
    "should not accept non-number input",
    async ({ canvas, userEvent }) => {
        const input = canvas.getByPlaceholderText(/number/i);
        await userEvent.type(input, "abc");
        expect(input).toHaveValue(null);
        expect(input).toHaveAttribute("type", "number");
    },
);

export const Disabled = meta.story({
    args: {
        disabled: true,
        placeholder: "Disabled input",
    },
});

Disabled.test("should not accept input", async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "Hello World");
    expect(input).toHaveValue("");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("disabled");
});

export const Loading = meta.story({
    args: {
        isLoading: true,
        placeholder: "Loading...",
    },
});

Loading.test("should show loading state", async ({ canvas }) => {
    const input = canvas.getByRole("textbox");
    expect(input).toBeDisabled();

    const skeleton = canvas.getByTestId("skeleton");
    expect(skeleton).toBeVisible();
});

export const WithValue = meta.story({
    args: {
        value: "Pre-filled value",
        placeholder: "Enter text...",
    },
});

export const PlaceholderAnimation = meta.story({
    args: {
        placeholderAnimation: true,
        placeholders: [
            "Search for anything...",
            "Try searching for users",
            "Look for messages",
        ] as const,
        runAnimation: true,
        switchInterval: 2000,
    },
});

PlaceholderAnimation.test(
    "should animate through placeholders",
    async ({ canvas, args }) => {
        const input = canvas.getByRole("textbox");
        expect(input).toBeVisible();

        const getPlaceholderText = () => {
            // Find the input element, then find its parent container
            const inputElement = document.querySelector('[data-slot="input"]');
            const parentContainer = inputElement?.parentElement;
            // Find the placeholder wrapper (sibling div with absolute positioning)
            const placeholderWrapper = parentContainer?.querySelector(
                ".pointer-events-none.absolute",
            );
            const span = placeholderWrapper?.querySelector("span");
            return span?.textContent?.trim() || "";
        };

        await waitFor(
            () => {
                const text = getPlaceholderText();
                expect(text).toBe(args.placeholders?.[0]);
            },
            { timeout: 3000 },
        );

        await waitFor(
            () => {
                const text = getPlaceholderText();
                expect(text).toBe(args.placeholders?.[1]);
            },
            { timeout: 2500 },
        );

        await waitFor(
            () => {
                const text = getPlaceholderText();
                expect(text).toBe(args.placeholders?.[2]);
            },
            { timeout: 2500 },
        );

        await waitFor(
            () => {
                const text = getPlaceholderText();
                expect(text).toBe(args.placeholders?.[0]);
            },
            { timeout: 2500 },
        );
    },
);

export const PlaceholderAnimationRandomized = meta.story({
    args: {
        placeholderAnimation: true,
        placeholders: [
            "First placeholder",
            "Second placeholder",
            "Third placeholder",
            "Fourth placeholder",
        ] as const,
        runAnimation: true,
        randomize: true,
        switchInterval: 2000,
    },
    parameters: {
        chromatic: { disableSnapshot: true },
    },
});

PlaceholderAnimationRandomized.test(
    "should randomize through placeholders",
    async ({ canvas, args }) => {
        const input = canvas.getByRole("textbox");
        expect(input).toBeVisible();

        const placeholders = args.placeholders || [];
        const seenPlaceholders = new Set<string>();
        let previousPlaceholder = "";

        const getPlaceholderText = () => {
            const inputElement = document.querySelector('[data-slot="input"]');
            const parentContainer = inputElement?.parentElement;
            const placeholderWrapper = parentContainer?.querySelector(
                ".pointer-events-none.absolute",
            );
            const span = placeholderWrapper?.querySelector("span");
            return span?.textContent?.trim() || "";
        };

        await waitFor(
            () => {
                const text = getPlaceholderText();
                expect(text).toBeTruthy();
                expect(placeholders).toContain(text);
                previousPlaceholder = text;
                seenPlaceholders.add(text);
            },
            { timeout: 3000 },
        );

        for (let i = 0; i < 6; i++) {
            await waitFor(
                () => {
                    const text = getPlaceholderText();
                    expect(text).toBeTruthy();
                    expect(placeholders).toContain(text);

                    if (placeholders.length > 1) {
                        expect(text).not.toBe(previousPlaceholder);
                    }

                    seenPlaceholders.add(text);
                    previousPlaceholder = text;
                },
                { timeout: 2500 },
            );
        }

        expect(seenPlaceholders.size).toBeGreaterThanOrEqual(
            Math.min(placeholders.length, 3),
        );

        seenPlaceholders.forEach(placeholder => {
            expect(placeholders).toContain(placeholder);
        });
    },
);

export const PlaceholderAnimationFast = meta.story({
    args: {
        placeholderAnimation: true,
        placeholders: [
            "Quick change 1",
            "Quick change 2",
            "Quick change 3",
        ] as const,
        runAnimation: true,
        switchInterval: 1000,
        switchDuration: 0.2,
    },
});

export const PlaceholderAnimationStopped = meta.story({
    args: {
        placeholderAnimation: true,
        placeholders: [
            "This won't animate",
            "Because runAnimation is false",
        ] as const,
        runAnimation: false,
    },
});

PlaceholderAnimationStopped.test(
    "should not animate when runAnimation is false",
    async ({ canvas }) => {
        const input = canvas.getByRole("textbox");
        expect(input).toHaveValue("");

        const getPlaceholderText = () => {
            const inputElement = document.querySelector('[data-slot="input"]');
            const parentContainer = inputElement?.parentElement;
            const placeholderWrapper = parentContainer?.querySelector(
                ".pointer-events-none.absolute",
            );
            const span = placeholderWrapper?.querySelector("span");
            return span?.textContent?.trim() || "";
        };

        const text = getPlaceholderText();
        expect(text).toBe("This won't animate");

        await new Promise(resolve => setTimeout(resolve, 2500));

        const textAfterWait = getPlaceholderText();
        expect(textAfterWait).toBe("This won't animate");
    },
);

export const PlaceholderAnimationWithValue = meta.story({
    args: {
        placeholderAnimation: true,
        placeholders: [
            "Animated placeholder 1",
            "Animated placeholder 2",
        ] as const,
        runAnimation: true,
        value: "User has typed something",
    },
});

PlaceholderAnimationWithValue.test(
    "should not show placeholder when value is set",
    async ({ canvas }) => {
        const getPlaceholderText = () => {
            const inputElement = document.querySelector('[data-slot="input"]');
            const parentContainer = inputElement?.parentElement;
            const placeholderWrapper = parentContainer?.querySelector(
                ".pointer-events-none.absolute",
            );
            const span = placeholderWrapper?.querySelector("span");
            return span?.textContent?.trim() || "";
        };

        const input = canvas.getByRole("textbox");
        expect(input).toHaveValue("User has typed something");
        const text = getPlaceholderText();
        expect(text).toBe("");
    },
);

export const WithError = meta.story({
    args: {
        placeholder: "Input with error",
        "aria-invalid": true,
    },
});

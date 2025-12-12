import preview from "#.storybook/preview";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { TextSwitch } from "./text-switch";

const meta = preview.meta({
    component: TextSwitch,
    tags: ["autodocs"],
    args: {
        onChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        value: {
            control: "text",
            description: "The currently active value",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        values: {
            control: "object",
            description: "Array of string values to switch between",
            table: {
                type: {
                    summary: "string[]",
                },
            },
        },
        separator: {
            control: "text",
            description: "The separator character between values",
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "|",
                },
            },
        },
        controlled: {
            control: "boolean",
            description:
                "Whether the switch is controlled externally (disables internal state updates)",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
        onChange: {
            description: "Callback when the value changes",
            table: {
                type: {
                    summary: "(value: string) => void",
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
        classNameItem: {
            control: "text",
            description: "Additional CSS classes for each value item",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameActive: {
            control: "text",
            description: "Additional CSS classes for the active value",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameInactive: {
            control: "text",
            description: "Additional CSS classes for inactive values",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameSeparator: {
            control: "text",
            description: "Additional CSS classes for the separator",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
    decorators: [
        Story => (
            <div className="bg-zinc-925">
                <Story />
            </div>
        ),
    ],
});

export const Default = meta.story({
    args: {
        value: "celsius",
        values: ["celsius", "fahrenheit"],
    },
});

Default.test("should render all values with separator", ({ canvas }) => {
    expect(canvas.getByText("celsius")).toBeVisible();
    expect(canvas.getByText("fahrenheit")).toBeVisible();
    expect(canvas.getByText("|")).toBeVisible();
});

Default.test("should mark active value with aria-current", ({ canvas }) => {
    const celsius = canvas.getByText("celsius");
    const fahrenheit = canvas.getByText("fahrenheit");

    expect(celsius).toHaveAttribute("aria-current", "true");
    expect(fahrenheit).toHaveAttribute("aria-current", "false");
});

Default.test("should call onChange on click", async ({ canvas, args }) => {
    const container = canvas.getByRole("group");
    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("fahrenheit");
    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("celsius");
});

export const ThreeValues = meta.story({
    name: "Three Values",
    args: {
        value: "small",
        values: ["small", "medium", "large"],
    },
});

ThreeValues.test("should render three values with separators", ({ canvas }) => {
    expect(canvas.getByText("small")).toBeVisible();
    expect(canvas.getByText("medium")).toBeVisible();
    expect(canvas.getByText("large")).toBeVisible();
    expect(canvas.getAllByText("|")).toHaveLength(2);
});

ThreeValues.test("should mark active value with aria-current", ({ canvas }) => {
    const small = canvas.getByText("small");
    const medium = canvas.getByText("medium");
    const large = canvas.getByText("large");

    expect(small).toHaveAttribute("aria-current", "true");
    expect(medium).toHaveAttribute("aria-current", "false");
    expect(large).toHaveAttribute("aria-current", "false");
});

ThreeValues.test("should cycle through values", async ({ canvas, args }) => {
    const container = canvas.getByRole("group");

    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("medium");
    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("large");
    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("small");
});

export const CustomSeparator = meta.story({
    name: "Custom Separator",
    args: {
        value: "on",
        values: ["on", "off"],
        separator: "/",
    },
});

CustomSeparator.test("should render with custom separator", ({ canvas }) => {
    expect(canvas.getByText("on")).toBeVisible();
    expect(canvas.getByText("off")).toBeVisible();
    expect(canvas.getByText("/")).toBeVisible();
});

CustomSeparator.test(
    "should mark active value with aria-current",
    ({ canvas }) => {
        const on = canvas.getByText("on");
        const off = canvas.getByText("off");

        expect(on).toHaveAttribute("aria-current", "true");
        expect(off).toHaveAttribute("aria-current", "false");
    },
);

export const DotSeparator = meta.story({
    name: "Dot Separator",
    args: {
        value: "light",
        values: ["light", "dark", "system"],
        separator: "•",
    },
});

DotSeparator.test("should render with dot separator", ({ canvas }) => {
    expect(canvas.getAllByText("•")).toHaveLength(2);
});

DotSeparator.test(
    "should mark active value with aria-current",
    ({ canvas }) => {
        const light = canvas.getByText("light");
        const dark = canvas.getByText("dark");
        const system = canvas.getByText("system");

        expect(light).toHaveAttribute("aria-current", "true");
        expect(dark).toHaveAttribute("aria-current", "false");
        expect(system).toHaveAttribute("aria-current", "false");
    },
);

export const Controlled = meta.story({
    args: {
        value: "celsius",
        values: ["celsius", "fahrenheit"],
        onChange: fn(),
    },
    render: ({ value, values, onChange }) => {
        const [internalValue, setInternalValue] = useState(value);

        return (
            <TextSwitch
                value={internalValue}
                values={values}
                onChange={(val: string) => {
                    setInternalValue(val);
                    onChange?.(val);
                }}
            />
        );
    },
});

Controlled.test("should update state on click", async ({ canvas, args }) => {
    const celsius = canvas.getByText("celsius");
    const fahrenheit = canvas.getByText("fahrenheit");
    const container = canvas.getByRole("group");

    expect(celsius).toHaveAttribute("aria-current", "true");
    expect(fahrenheit).toHaveAttribute("aria-current", "false");

    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("fahrenheit");
    expect(celsius).toHaveAttribute("aria-current", "false");
    expect(fahrenheit).toHaveAttribute("aria-current", "true");

    await userEvent.click(container);
    expect(args.onChange).toHaveBeenCalledWith("celsius");
    expect(celsius).toHaveAttribute("aria-current", "true");
    expect(fahrenheit).toHaveAttribute("aria-current", "false");
});

export const ControlledThreeValues = meta.story({
    args: {
        value: "small",
        values: ["small", "medium", "large"],
        onChange: fn(),
    },
    render: ({ value, values, onChange }) => {
        const [internalValue, setInternalValue] = useState(value);

        return (
            <TextSwitch
                value={internalValue}
                values={values}
                onChange={(val: string) => {
                    setInternalValue(val);
                    onChange?.(val);
                }}
            />
        );
    },
});

ControlledThreeValues.test(
    "should cycle through all three values",
    async ({ canvas, args }) => {
        const small = canvas.getByText("small");
        const medium = canvas.getByText("medium");
        const large = canvas.getByText("large");
        const container = canvas.getByRole("group");

        expect(small).toHaveAttribute("aria-current", "true");
        expect(medium).toHaveAttribute("aria-current", "false");
        expect(large).toHaveAttribute("aria-current", "false");

        await userEvent.click(container);
        expect(args.onChange).toHaveBeenCalledWith("medium");
        expect(small).toHaveAttribute("aria-current", "false");
        expect(medium).toHaveAttribute("aria-current", "true");
        expect(large).toHaveAttribute("aria-current", "false");

        await userEvent.click(container);
        expect(args.onChange).toHaveBeenCalledWith("large");
        expect(small).toHaveAttribute("aria-current", "false");
        expect(medium).toHaveAttribute("aria-current", "false");
        expect(large).toHaveAttribute("aria-current", "true");

        await userEvent.click(container);
        expect(args.onChange).toHaveBeenCalledWith("small");
        expect(small).toHaveAttribute("aria-current", "true");
        expect(medium).toHaveAttribute("aria-current", "false");
        expect(large).toHaveAttribute("aria-current", "false");
    },
);

import preview from "#.storybook/preview";
import { expect, fn } from "storybook/test";

import { Label } from "@/components/ui/label";

import { Textarea } from "./textarea";

const meta = preview.meta({
    component: Textarea,
    render: args => (
        <>
            <label htmlFor="textarea" className="sr-only">
                Textarea
            </label>
            <Textarea {...args} id="textarea" />
        </>
    ),
    args: {
        placeholder: "Enter your message...",
        onChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        placeholder: {
            control: "text",
            description: "Placeholder text for the textarea",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the textarea is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        isLoading: {
            control: "boolean",
            description:
                "Whether the textarea is in loading state with skeleton placeholders",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        skeletonsLength: {
            control: "number",
            description: "Number of skeleton lines to display when loading",
            table: {
                type: {
                    summary: "number",
                },
                defaultValue: {
                    summary: "2",
                },
            },
        },
        classNameSkeleton: {
            control: "text",
            description: "Additional CSS classes for skeleton elements",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameInputWrapper: {
            control: "text",
            description:
                "Additional CSS classes for the wrapper div (when loading)",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the textarea element",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        rows: {
            control: "number",
            description: "Number of visible text lines",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        value: {
            control: "text",
            description: "The controlled value of the textarea",
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
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeVisible();
    expect(textarea).toBeEnabled();

    await userEvent.type(textarea, "Hello World");
    expect(textarea).toHaveValue("Hello World");
    expect(args.onChange).toHaveBeenCalled();
});

export const Disabled = meta.story({
    args: {
        disabled: true,
        placeholder: "This textarea is disabled",
    },
});

Disabled.test("should not accept input", async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Hello World");
    expect(textarea).toHaveValue("");
    expect(textarea).toBeDisabled();
});

export const Loading = meta.story({
    args: {
        isLoading: true,
        placeholder: "Loading...",
    },
});

Loading.test("should show loading state with skeletons", async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeDisabled();

    const skeletons = canvas.getAllByTestId("skeleton");
    expect(skeletons).toHaveLength(2);
});

Loading.test("should not accept input", async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Hello World");
    expect(textarea).toHaveValue("");
    expect(textarea).toBeDisabled();
});

export const WithLabel = meta.story({
    render: args => (
        <div className="flex flex-col gap-2">
            <Label htmlFor="with-label">Your message</Label>
            <Textarea {...args} id="with-label" />
        </div>
    ),
});

WithLabel.test("should be associated with label", async ({ canvas }) => {
    const textarea = canvas.getByLabelText("Your message");
    expect(textarea).toBeVisible();
});

export const WithError = meta.story({
    args: {
        placeholder: "This field has an error",
        "aria-invalid": true,
    },
});

WithError.test("should show error state", ({ canvas }) => {
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
});

export const WithDefaultValue = meta.story({
    args: {
        defaultValue:
            "This is some pre-filled content in the textarea that the user might want to edit.",
    },
});

WithDefaultValue.test("should display default value", ({ canvas }) => {
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toHaveValue(
        "This is some pre-filled content in the textarea that the user might want to edit.",
    );
});

WithDefaultValue.test(
    "should be interactive",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, " Hello World");
        expect(textarea).toHaveValue(
            "This is some pre-filled content in the textarea that the user might want to edit. Hello World",
        );
    },
);

export const ReadOnly = meta.story({
    args: {
        readOnly: true,
        value: "This content is read-only and cannot be edited.",
    },
});

ReadOnly.test("should be read-only", ({ canvas }) => {
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toHaveAttribute("readonly");
});

ReadOnly.test("should not accept input", async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Hello World");
    expect(textarea).toHaveValue(
        "This content is read-only and cannot be edited.",
    );
});

export const MaxLength = meta.story({
    args: {
        maxLength: 100,
        placeholder: "Limited to 100 characters",
    },
});

MaxLength.test("should respect max length", async ({ canvas, userEvent }) => {
    const textarea = canvas.getByRole("textbox");
    const longText = "a".repeat(150);
    await userEvent.type(textarea, longText);
    expect(textarea).toHaveValue("a".repeat(100));
});

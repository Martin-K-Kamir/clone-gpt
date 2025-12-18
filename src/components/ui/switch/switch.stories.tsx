import preview from "#.storybook/preview";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { Label } from "@/components/ui/label";

import { Switch } from "./switch";

const meta = preview.meta({
    component: Switch,
    args: {
        onCheckedChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        checked: {
            control: "boolean",
            description: "The controlled checked state of the switch",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultChecked: {
            control: "boolean",
            description: "The default checked state when uncontrolled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onCheckedChange: {
            description: "Callback when the checked state changes",
            table: {
                type: {
                    summary: "(checked: boolean) => void",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the switch is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        required: {
            control: "boolean",
            description: "Whether the switch is required in a form",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        name: {
            control: "text",
            description: "The name of the switch for form submission",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        value: {
            control: "text",
            description: "The value of the switch for form submission",
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: "on",
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

export const Default = meta.story();

Default.test("should be interactive", async ({ canvas, args }) => {
    const switchEl = canvas.getByRole("switch");
    expect(switchEl).toBeEnabled();
    expect(switchEl).toBeVisible();
    expect(switchEl).toHaveAttribute("aria-checked", "false");

    await userEvent.click(switchEl);
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    expect(switchEl).toHaveAttribute("aria-checked", "true");
});

Default.test("should toggle state on click", async ({ canvas }) => {
    const switchEl = canvas.getByRole("switch");
    expect(switchEl).toHaveAttribute("data-state", "unchecked");

    await userEvent.click(switchEl);
    await waitFor(() => {
        expect(switchEl).toHaveAttribute("data-state", "checked");
    });

    await userEvent.click(switchEl);
    await waitFor(() => {
        expect(switchEl).toHaveAttribute("data-state", "unchecked");
    });
});

Default.test(
    "should toggle when space is pressed",
    async ({ canvas, args }) => {
        const switchEl = canvas.getByRole("switch");
        switchEl.focus();
        expect(switchEl).toHaveFocus();
        expect(switchEl).toHaveAttribute("aria-checked", "false");

        await userEvent.keyboard(" ");
        expect(args.onCheckedChange).toHaveBeenCalledWith(true);
        expect(switchEl).toHaveAttribute("aria-checked", "true");
    },
);

export const Checked = meta.story({
    args: {
        defaultChecked: true,
    },
});

Checked.test("should start in checked state", ({ canvas }) => {
    const switchEl = canvas.getByRole("switch");
    expect(switchEl).toHaveAttribute("data-state", "checked");
});

export const Disabled = meta.story({
    args: {
        disabled: true,
    },
});

Disabled.test("should be disabled", async ({ canvas, args }) => {
    const switchEl = canvas.getByRole("switch");
    expect(switchEl).toBeDisabled();

    await userEvent.click(switchEl);
    expect(args.onCheckedChange).not.toHaveBeenCalled();
});

export const DisabledChecked = meta.story({
    name: "Disabled & Checked",
    args: {
        disabled: true,
        defaultChecked: true,
    },
});

DisabledChecked.test("should be disabled and checked", ({ canvas }) => {
    const switchEl = canvas.getByRole("switch");
    expect(switchEl).toBeDisabled();
    expect(switchEl).toHaveAttribute("data-state", "checked");
});

export const InForm = meta.story({
    name: "In Form Context",
    render: () => (
        <form className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Push notifications</Label>
                <Switch id="notifications" name="notifications" />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="marketing">Marketing emails</Label>
                <Switch id="marketing" name="marketing" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="updates">Product updates</Label>
                <Switch id="updates" name="updates" disabled />
            </div>
        </form>
    ),
});

InForm.test(
    "should toggle switch when clicking on label",
    async ({ canvas, userEvent }) => {
        const notificationsLabel = canvas.getByLabelText("Push notifications");
        const notificationsSwitch = canvas.getByRole("switch", {
            name: "Push notifications",
        });

        expect(notificationsSwitch).toHaveAttribute("aria-checked", "false");

        await userEvent.click(notificationsLabel);
        expect(notificationsSwitch).toHaveAttribute("aria-checked", "true");
    },
);

InForm.test(
    "should toggle checked switch when clicking on label",
    async ({ canvas, userEvent }) => {
        const marketingLabel = canvas.getByLabelText("Marketing emails");
        const marketingSwitch = canvas.getByRole("switch", {
            name: "Marketing emails",
        });

        expect(marketingSwitch).toHaveAttribute("aria-checked", "true");

        await userEvent.click(marketingLabel);
        expect(marketingSwitch).toHaveAttribute("aria-checked", "false");
    },
);

InForm.test(
    "should not toggle disabled switch when clicking on label",
    async ({ canvas, userEvent }) => {
        const updatesLabel = canvas.getByLabelText("Product updates");
        const updatesSwitch = canvas.getByRole("switch", {
            name: "Product updates",
        });

        expect(updatesSwitch).toBeDisabled();
        expect(updatesSwitch).toHaveAttribute("aria-checked", "false");

        await userEvent.click(updatesLabel);

        expect(updatesSwitch).toHaveAttribute("aria-checked", "false");
    },
);

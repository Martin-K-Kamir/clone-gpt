import preview from "#.storybook/preview";

import { Input } from "@/components/ui/input";

import { Label } from "./label";

const meta = preview.meta({
    component: Label,
    argTypes: {
        htmlFor: {
            control: "text",
            description: "Associates the label with a form control",
            table: {
                type: {
                    summary: "string",
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
        children: {
            control: "text",
            description: "Label text content",
            table: {
                type: {
                    summary: "ReactNode",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        children: "Label",
    },
});

export const WithInput = meta.story({
    render: ({ ...args }) => (
        <div className="space-y-2">
            <Label htmlFor="email-input" {...args}>
                Email Address
            </Label>
            <Input
                id="email-input"
                type="email"
                placeholder="Enter your email"
            />
        </div>
    ),
    args: {
        children: "Email Address",
    },
});

export const WithDisabledInput = meta.story({
    render: ({ ...args }) => (
        <div className="space-y-2">
            <Label htmlFor="disabled-input" {...args}>
                Disabled Field
            </Label>
            <Input
                id="disabled-input"
                type="text"
                placeholder="This field is disabled"
                disabled
            />
        </div>
    ),
    args: {
        children: "Disabled Field",
    },
});

export const InFormContext = meta.story({
    render: () => (
        <form className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" type="text" placeholder="John" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" type="text" placeholder="Doe" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
            </div>
        </form>
    ),
});

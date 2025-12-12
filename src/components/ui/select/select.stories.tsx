import preview from "#.storybook/preview";
import {
    GlobeIcon,
    MailIcon,
    MoonIcon,
    PaletteIcon,
    SunIcon,
    UserIcon,
} from "lucide-react";
import { useState } from "react";
import { expect, fireEvent, fn, waitFor } from "storybook/test";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "./index";

const meta = preview.meta({
    component: Select,
    tags: ["autodocs"],
    args: {
        onValueChange: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        value: {
            control: "text",
            description: "The controlled value of the select",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        defaultValue: {
            control: "text",
            description: "The default value of the select",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the select is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        open: {
            control: "boolean",
            description: "Whether the select is open",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        onValueChange: {
            control: false,
            table: {
                disable: true,
            },
        },
    },
});

export const Default = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Select a fruit"
            >
                <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="grape">Grape</SelectItem>
                <SelectItem value="mango">Mango</SelectItem>
            </SelectContent>
        </Select>
    ),
});

Default.test(
    "should open dropdown, select item, and close automatically",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("combobox");
        expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger);

        const content = await waitFor(() =>
            document.querySelector('[data-slot="select-content"]'),
        );
        expect(content).toBeInTheDocument();

        const item = await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="select-item"]',
            );
            return Array.from(items).find(item =>
                item.textContent?.includes("Banana"),
            );
        });

        if (item) {
            await userEvent.click(item);
        }

        expect(args.onValueChange).toHaveBeenCalledWith("banana");

        await waitFor(() => {
            const contentClosed = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(contentClosed).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should close dropdown when clicking outside",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        fireEvent.pointerDown(document.body);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should close dropdown when pressing Escape key",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        await userEvent.keyboard("{Escape}");

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should display checkmark icon on selected item",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        const appleItem = await waitFor(() => {
            const items = document.querySelectorAll(
                '[data-slot="select-item"]',
            );
            return Array.from(items).find(item =>
                item.textContent?.includes("Apple"),
            );
        });

        if (appleItem) {
            await userEvent.click(appleItem);
        }

        await userEvent.click(trigger);

        await waitFor(() => {
            const selectedItem = document.querySelector(
                '[data-slot="select-item"][data-state="checked"]',
            );
            expect(selectedItem).toBeInTheDocument();
            expect(selectedItem?.textContent).toContain("Apple");

            const checkIcon = selectedItem?.querySelector("svg");
            expect(checkIcon).toBeInTheDocument();
        });
    },
);

Default.test(
    "should navigate through items using arrow keys",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowUp}");
        await userEvent.keyboard("{ArrowUp}");

        const highlightedItem = document.querySelector(
            '[data-slot="select-item"][data-highlighted]',
        );
        expect(highlightedItem).toBeInTheDocument();
    },
);

Default.test(
    "should select item when pressing Enter key",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{Enter}");

        expect(args.onValueChange).toHaveBeenCalled();

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).not.toBeInTheDocument();
        });
    },
);

Default.test(
    "should call onValueChange with correct value when clicking item",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("combobox");

        await userEvent.click(trigger);
        await waitFor(() => {
            expect(
                document.querySelector('[data-slot="select-content"]'),
            ).toBeInTheDocument();
        });

        const orangeItem = await waitFor(() => {
            const items = document.querySelectorAll('[role="option"]');
            return Array.from(items).find(item =>
                item.textContent?.includes("Orange"),
            );
        });
        if (orangeItem) await userEvent.click(orangeItem);

        expect(args.onValueChange).toHaveBeenCalledWith("orange");
        expect(args.onValueChange).toHaveBeenCalledTimes(1);

        await userEvent.click(trigger);
        await waitFor(() => {
            expect(
                document.querySelector('[data-slot="select-content"]'),
            ).toBeInTheDocument();
        });

        const grapeItem = await waitFor(() => {
            const items = document.querySelectorAll('[role="option"]');
            return Array.from(items).find(item =>
                item.textContent?.includes("Grape"),
            );
        });
        if (grapeItem) await userEvent.click(grapeItem);

        expect(args.onValueChange).toHaveBeenCalledWith("grape");
        expect(args.onValueChange).toHaveBeenCalledTimes(2);
    },
);

Default.test(
    "should call onValueChange with correct value when pressing Enter",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("combobox");

        await userEvent.click(trigger);
        await waitFor(() => {
            expect(
                document.querySelector('[data-slot="select-content"]'),
            ).toBeInTheDocument();
        });

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{Enter}");

        expect(args.onValueChange).toHaveBeenCalledWith("orange");
        expect(args.onValueChange).toHaveBeenCalledTimes(1);

        await userEvent.click(trigger);
        await waitFor(() => {
            expect(
                document.querySelector('[data-slot="select-content"]'),
            ).toBeInTheDocument();
        });

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{Enter}");

        expect(args.onValueChange).toHaveBeenCalledWith("mango");
        expect(args.onValueChange).toHaveBeenCalledTimes(2);
    },
);

Default.test(
    "should not navigate past the last item with arrow down",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        for (let i = 0; i < 10; i++) {
            await userEvent.keyboard("{ArrowDown}");
        }

        const items = document.querySelectorAll('[data-slot="select-item"]');
        const lastItem = items[items.length - 1];
        expect(lastItem).toHaveAttribute("data-highlighted");
    },
);

Default.test(
    "should not navigate before the first item with arrow up",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        for (let i = 0; i < 10; i++) {
            await userEvent.keyboard("{ArrowUp}");
        }

        const items = document.querySelectorAll('[data-slot="select-item"]');
        const firstItem = items[0];
        expect(firstItem).toHaveAttribute("data-highlighted");
    },
);

export const WithDefaultValue = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: args => (
        <Select defaultValue="banana" {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Select a fruit"
            >
                <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
            </SelectContent>
        </Select>
    ),
});

WithDefaultValue.test(
    "should display pre-selected value in trigger",
    async ({ canvas }) => {
        const trigger = canvas.getByRole("combobox");
        expect(trigger).toHaveTextContent("Banana");
    },
);

WithDefaultValue.test(
    "should show checkmark on pre-selected item when opened",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const selectedItem = document.querySelector(
                '[data-slot="select-item"][data-state="checked"]',
            );
            expect(selectedItem).toBeInTheDocument();
            expect(selectedItem?.textContent).toContain("Banana");

            const checkIcon = selectedItem?.querySelector("svg");
            expect(checkIcon).toBeInTheDocument();
        });
    },
);

export const WithGroups = meta.story({
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Select a food"
            >
                <SelectValue placeholder="Select a food" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                    <SelectLabel>Vegetables</SelectLabel>
                    <SelectItem value="carrot">Carrot</SelectItem>
                    <SelectItem value="broccoli">Broccoli</SelectItem>
                    <SelectItem value="spinach">Spinach</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
});

export const WithIcons = meta.story({
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Select a theme"
            >
                <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">
                    <SunIcon className="size-4" />
                    Light
                </SelectItem>
                <SelectItem value="dark">
                    <MoonIcon className="size-4" />
                    Dark
                </SelectItem>
                <SelectItem value="system">
                    <PaletteIcon className="size-4" />
                    System
                </SelectItem>
            </SelectContent>
        </Select>
    ),
});

export const SizeSmall = meta.story({
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                size="sm"
                aria-label="Small select"
            >
                <SelectValue placeholder="Small select" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
        </Select>
    ),
});

export const Loading = meta.story({
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-full"
                isLoading
                aria-label="Loading select"
            >
                <SelectValue placeholder="Loading..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
        </Select>
    ),
});

Loading.test(
    "should disable trigger and display skeleton placeholder",
    async ({ canvas }) => {
        const trigger = canvas.getByRole("combobox");
        expect(trigger).toBeDisabled();

        const skeleton = document.querySelector('[data-slot="skeleton"]');
        expect(skeleton).toBeInTheDocument();
    },
);

export const Disabled = meta.story({
    render: args => (
        <Select disabled {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Disabled select"
            >
                <SelectValue placeholder="Disabled select" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
        </Select>
    ),
});

Disabled.test(
    "should prevent interaction when select is disabled",
    async ({ canvas }) => {
        const trigger = canvas.getByRole("combobox");
        expect(trigger).toBeDisabled();
    },
);

export const WithDisabledItems = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Select an option"
            >
                <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="option1">Available</SelectItem>
                <SelectItem value="option2" disabled>
                    Unavailable
                </SelectItem>
                <SelectItem value="option3">Available</SelectItem>
                <SelectItem value="option4" disabled>
                    Unavailable
                </SelectItem>
            </SelectContent>
        </Select>
    ),
});

WithDisabledItems.test(
    "should render items with disabled state attribute",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        const items = await waitFor(() =>
            document.querySelectorAll('[data-slot="select-item"]'),
        );

        const disabledItems = Array.from(items).filter(
            item => item.getAttribute("data-disabled") === "",
        );
        expect(disabledItems).toHaveLength(2);
    },
);

WithDisabledItems.test(
    "should skip disabled items when navigating with keyboard",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{ArrowDown}");

        const highlightedItem = document.querySelector(
            '[data-slot="select-item"][data-highlighted]',
        );

        expect(highlightedItem).not.toHaveAttribute("data-disabled");
    },
);

WithDisabledItems.test(
    "should not select disabled item when pressing Enter on it",
    async ({ canvas, userEvent, args }) => {
        const trigger = canvas.getByRole("combobox");
        await userEvent.click(trigger);

        await waitFor(() => {
            const content = document.querySelector(
                '[data-slot="select-content"]',
            );
            expect(content).toBeInTheDocument();
        });

        await userEvent.keyboard("{ArrowDown}");
        await userEvent.keyboard("{Enter}");

        expect(args.onValueChange).toHaveBeenCalled();
        expect(args.onValueChange).not.toHaveBeenCalledWith("option2");
        expect(args.onValueChange).not.toHaveBeenCalledWith("option4");
    },
);

export const Controlled = meta.story({
    render: args => {
        const [value, setValue] = useState("apple");

        return (
            <div className="bg-zinc-925 flex flex-col gap-4 rounded-lg p-4">
                <Select
                    value={value}
                    onValueChange={val => {
                        setValue(val);
                        args.onValueChange?.(val);
                    }}
                >
                    <SelectTrigger
                        className="w-[200px] bg-zinc-800"
                        aria-label="Select a fruit"
                    >
                        <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-sm text-zinc-400">
                    Selected value:{" "}
                    <span className="text-zinc-100">{value}</span>
                </p>
            </div>
        );
    },
});

export const LongList = meta.story({
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[200px] bg-zinc-800"
                aria-label="Select a country"
            >
                <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="es">Spain</SelectItem>
                <SelectItem value="it">Italy</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="kr">South Korea</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
                <SelectItem value="mx">Mexico</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="ru">Russia</SelectItem>
            </SelectContent>
        </Select>
    ),
});

export const WithIconsAndGroups = meta.story({
    render: args => (
        <Select {...args}>
            <SelectTrigger
                className="w-[220px] bg-zinc-800"
                aria-label="Select a setting"
            >
                <SelectValue placeholder="Select a setting" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Account</SelectLabel>
                    <SelectItem value="profile">
                        <UserIcon className="size-4" />
                        Profile
                    </SelectItem>
                    <SelectItem value="email">
                        <MailIcon className="size-4" />
                        Email Settings
                    </SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                    <SelectLabel>Preferences</SelectLabel>
                    <SelectItem value="theme">
                        <PaletteIcon className="size-4" />
                        Theme
                    </SelectItem>
                    <SelectItem value="language">
                        <GlobeIcon className="size-4" />
                        Language
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    ),
});

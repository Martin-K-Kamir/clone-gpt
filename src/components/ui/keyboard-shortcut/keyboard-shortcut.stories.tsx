import preview from "#.storybook/preview";
import { expect, fn, waitFor } from "storybook/test";

import { OPERATING_SYSTEM } from "@/lib/constants";

import { KeyboardShortcut } from "./keyboard-shortcut";

const meta = preview.meta({
    component: KeyboardShortcut,
    argTypes: {
        platformDetection: {
            control: "select",
            options: ["default", "custom"],
            description:
                "Platform detection method: 'default' uses automatic detection, or provide a custom function",
            table: {
                type: {
                    summary: '"default" | (() => OperatingSystem | null)',
                },
                defaultValue: {
                    summary: "default",
                },
            },
        },
        shortcuts: {
            control: "object",
            description:
                "Object mapping operating systems to their keyboard shortcut strings",
            table: {
                type: {
                    summary: "Partial<Record<OperatingSystem, string>>",
                },
            },
        },
        onShortcut: {
            action: "shortcut-triggered",
            description:
                "Callback function called when the keyboard shortcut is triggered",
            table: {
                type: {
                    summary:
                        "(event: KeyboardEvent, os: OperatingSystem | null, shortcut: string | null) => void",
                },
            },
        },
        as: {
            control: "select",
            options: ["span", "div", "kbd", "code"],
            description: "The HTML element or component to render as",
            table: {
                type: {
                    summary: "ElementType",
                },
                defaultValue: {
                    summary: "span",
                },
            },
        },
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
});

export const Default = meta.story({
    parameters: {
        chromatic: { disableSnapshot: true },
    },
    args: {
        platformDetection: () => OPERATING_SYSTEM.MACOS,
        shortcuts: {
            [OPERATING_SYSTEM.MACOS]: "⌘ K",
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
            [OPERATING_SYSTEM.LINUX]: "Ctrl K",
        },
        onShortcut: fn(),
    },
});

Default.test(
    "should trigger onShortcut when keyboard shortcut is pressed",
    async ({ args }) => {
        const keyboardEvent = new KeyboardEvent("keydown", {
            key: "k",
            code: "KeyK",
            metaKey: true,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            bubbles: true,
            cancelable: true,
        });

        document.dispatchEvent(keyboardEvent);

        await waitFor(
            () => {
                expect(args.onShortcut).toHaveBeenCalled();
            },
            { timeout: 1000 },
        );

        expect(args.onShortcut).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            OPERATING_SYSTEM.MACOS,
            "⌘ K",
        );
    },
);

export const Windows = meta.story({
    args: {
        platformDetection: () => OPERATING_SYSTEM.WINDOWS,
        shortcuts: {
            [OPERATING_SYSTEM.MACOS]: "⌘ K",
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
            [OPERATING_SYSTEM.LINUX]: "Ctrl K",
        },
    },
});

export const Linux = meta.story({
    args: {
        platformDetection: () => OPERATING_SYSTEM.LINUX,
        shortcuts: {
            [OPERATING_SYSTEM.MACOS]: "⌘ K",
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
            [OPERATING_SYSTEM.LINUX]: "Ctrl K",
        },
    },
});

export const WithCtrlShortcut = meta.story({
    parameters: {
        chromatic: { disableSnapshot: true },
    },
    args: {
        platformDetection: () => OPERATING_SYSTEM.MACOS,
        shortcuts: {
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl Shift S",
            [OPERATING_SYSTEM.MACOS]: "⌘ Shift S",
        },
        onShortcut: fn(),
    },
});

WithCtrlShortcut.test(
    "should trigger onShortcut with Cmd+Shift+S",
    async ({ args }) => {
        const keyboardEvent = new KeyboardEvent("keydown", {
            key: "s",
            code: "KeyS",
            metaKey: true,
            ctrlKey: false,
            shiftKey: true,
            altKey: false,
            bubbles: true,
            cancelable: true,
        });

        document.dispatchEvent(keyboardEvent);

        await waitFor(
            () => {
                expect(args.onShortcut).toHaveBeenCalled();
            },
            { timeout: 1000 },
        );

        expect(args.onShortcut).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            OPERATING_SYSTEM.MACOS,
            "⌘ Shift S",
        );
    },
);

export const WithoutOSDetection = meta.story({
    args: {
        platformDetection: () => null,
        shortcuts: {
            [OPERATING_SYSTEM.MACOS]: "⌘ K",
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
        },
    },
});

export const ComplexShortcut = meta.story({
    parameters: {
        chromatic: { disableSnapshot: true },
    },
    args: {
        platformDetection: () => OPERATING_SYSTEM.MACOS,
        shortcuts: {
            [OPERATING_SYSTEM.MACOS]: "⌘ Shift Option K",
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl Shift Alt K",
        },
        onShortcut: fn(),
    },
});

ComplexShortcut.test(
    "should handle complex shortcuts with multiple modifiers",
    async ({ args }) => {
        const keyboardEvent = new KeyboardEvent("keydown", {
            key: "k",
            code: "KeyK",
            metaKey: true,
            ctrlKey: false,
            shiftKey: true,
            altKey: true,
            bubbles: true,
            cancelable: true,
        });

        document.dispatchEvent(keyboardEvent);

        await waitFor(
            () => {
                expect(args.onShortcut).toHaveBeenCalled();
            },
            { timeout: 1000 },
        );

        expect(args.onShortcut).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            OPERATING_SYSTEM.MACOS,
            "⌘ Shift Option K",
        );
    },
);

export const AllPlatforms = meta.story({
    render: () => {
        const shortcuts = {
            [OPERATING_SYSTEM.MACOS]: "⌘ K",
            [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
            [OPERATING_SYSTEM.LINUX]: "Ctrl K",
            [OPERATING_SYSTEM.ANDROID]: "Ctrl K",
            [OPERATING_SYSTEM.IOS]: "⌘ K",
        };

        return (
            <div className="bg-zinc-925 space-y-4 rounded-2xl p-4">
                <div>
                    <p className="mb-2 text-sm text-zinc-100">macOS</p>
                    <KeyboardShortcut
                        platformDetection={() => OPERATING_SYSTEM.MACOS}
                        shortcuts={shortcuts}
                    />
                </div>
                <div>
                    <p className="mb-2 text-sm text-zinc-100">Windows</p>
                    <KeyboardShortcut
                        platformDetection={() => OPERATING_SYSTEM.WINDOWS}
                        shortcuts={shortcuts}
                    />
                </div>
                <div>
                    <p className="mb-2 text-sm text-zinc-100">Linux</p>
                    <KeyboardShortcut
                        platformDetection={() => OPERATING_SYSTEM.LINUX}
                        shortcuts={shortcuts}
                    />
                </div>
            </div>
        );
    },
});

import {
    MOCK_ALL_PLATFORMS_SHORTCUTS,
    MOCK_CMD_K_SHORTCUTS,
    MOCK_COMPLEX_SHORTCUTS,
    MOCK_SHIFT_S_SHORTCUTS,
} from "#.storybook/lib/mocks/keyboard-shortcut";
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
        shortcuts: MOCK_CMD_K_SHORTCUTS,
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
        shortcuts: MOCK_CMD_K_SHORTCUTS,
    },
});

export const Linux = meta.story({
    args: {
        platformDetection: () => OPERATING_SYSTEM.LINUX,
        shortcuts: MOCK_CMD_K_SHORTCUTS,
    },
});

export const WithCtrlShortcut = meta.story({
    parameters: {
        chromatic: { disableSnapshot: true },
    },
    args: {
        platformDetection: () => OPERATING_SYSTEM.MACOS,
        shortcuts: MOCK_SHIFT_S_SHORTCUTS,
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
            [OPERATING_SYSTEM.MACOS]:
                MOCK_CMD_K_SHORTCUTS[OPERATING_SYSTEM.MACOS],
            [OPERATING_SYSTEM.WINDOWS]:
                MOCK_CMD_K_SHORTCUTS[OPERATING_SYSTEM.WINDOWS],
        },
    },
});

export const ComplexShortcut = meta.story({
    parameters: {
        chromatic: { disableSnapshot: true },
    },
    args: {
        platformDetection: () => OPERATING_SYSTEM.MACOS,
        shortcuts: MOCK_COMPLEX_SHORTCUTS,
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
        return (
            <div className="bg-zinc-925 space-y-4 rounded-2xl p-4">
                <div>
                    <p className="mb-2 text-sm text-zinc-100">macOS</p>
                    <KeyboardShortcut
                        platformDetection={() => OPERATING_SYSTEM.MACOS}
                        shortcuts={MOCK_ALL_PLATFORMS_SHORTCUTS}
                    />
                </div>
                <div>
                    <p className="mb-2 text-sm text-zinc-100">Windows</p>
                    <KeyboardShortcut
                        platformDetection={() => OPERATING_SYSTEM.WINDOWS}
                        shortcuts={MOCK_ALL_PLATFORMS_SHORTCUTS}
                    />
                </div>
                <div>
                    <p className="mb-2 text-sm text-zinc-100">Linux</p>
                    <KeyboardShortcut
                        platformDetection={() => OPERATING_SYSTEM.LINUX}
                        shortcuts={MOCK_ALL_PLATFORMS_SHORTCUTS}
                    />
                </div>
            </div>
        );
    },
});

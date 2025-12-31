/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import type { NormalizedShortcut } from "@/lib/utils/parse-shortcut";

import { shouldTriggerShortcut } from "./should-trigger-shortcut";

function createKeyboardEvent(
    key: string,
    options: {
        metaKey?: boolean;
        shiftKey?: boolean;
        ctrlKey?: boolean;
        altKey?: boolean;
    } = {},
): KeyboardEvent {
    return new KeyboardEvent("keydown", {
        key,
        metaKey: options.metaKey ?? false,
        shiftKey: options.shiftKey ?? false,
        ctrlKey: options.ctrlKey ?? false,
        altKey: options.altKey ?? false,
    });
}

describe("shouldTriggerShortcut", () => {
    it("should return true when event matches one shortcut", () => {
        const event = createKeyboardEvent("a");
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "a",
                metaKey: false,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(true);
    });

    it("should return false when event matches no shortcuts", () => {
        const event = createKeyboardEvent("a");
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "b",
                metaKey: false,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(false);
    });

    it("should return true when event matches any of multiple shortcuts", () => {
        const event = createKeyboardEvent("a", { metaKey: true });
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "b",
                metaKey: false,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
            {
                key: "a",
                metaKey: true,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(true);
    });

    it("should return false when event matches none of multiple shortcuts", () => {
        const event = createKeyboardEvent("a");
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "b",
                metaKey: false,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
            {
                key: "c",
                metaKey: false,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(false);
    });

    it("should handle empty shortcuts array", () => {
        const event = createKeyboardEvent("a");
        expect(shouldTriggerShortcut(event, [])).toBe(false);
    });

    it("should match with modifiers", () => {
        const event = createKeyboardEvent("s", {
            metaKey: true,
            shiftKey: true,
        });
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "s",
                metaKey: true,
                shiftKey: true,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(true);
    });

    it("should not match when modifiers differ", () => {
        const event = createKeyboardEvent("s", { metaKey: true });
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "s",
                metaKey: true,
                shiftKey: true,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(false);
    });

    it("should handle multiple shortcuts with different modifiers", () => {
        const event = createKeyboardEvent("k", { metaKey: true });
        const shortcuts: NormalizedShortcut[] = [
            {
                key: "k",
                metaKey: false,
                shiftKey: true,
                ctrlKey: false,
                altKey: false,
            },
            {
                key: "k",
                metaKey: true,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
            },
        ];

        expect(shouldTriggerShortcut(event, shortcuts)).toBe(true);
    });
});

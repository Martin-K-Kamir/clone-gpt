/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import type { NormalizedShortcut } from "@/lib/utils/parse-shortcut";

import { matchesShortcut } from "./matches-shortcut";

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

describe("matchesShortcut", () => {
    it("should return true for matching key without modifiers", () => {
        const event = createKeyboardEvent("a");
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return false for non-matching key", () => {
        const event = createKeyboardEvent("a");
        const shortcut: NormalizedShortcut = {
            key: "b",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it("should return true for matching key with metaKey", () => {
        const event = createKeyboardEvent("a", { metaKey: true });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: true,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return false when metaKey does not match", () => {
        const event = createKeyboardEvent("a", { metaKey: true });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it("should return true for matching key with shiftKey", () => {
        const event = createKeyboardEvent("A", { shiftKey: true });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return true for matching key with ctrlKey", () => {
        const event = createKeyboardEvent("a", { ctrlKey: true });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return true for matching key with altKey", () => {
        const event = createKeyboardEvent("a", { altKey: true });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return true for matching key with all modifiers", () => {
        const event = createKeyboardEvent("a", {
            metaKey: true,
            shiftKey: true,
            ctrlKey: true,
            altKey: true,
        });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: true,
            shiftKey: true,
            ctrlKey: true,
            altKey: true,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return false when any modifier does not match", () => {
        const event = createKeyboardEvent("a", {
            metaKey: true,
            shiftKey: true,
        });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: true,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it("should handle case-insensitive key matching", () => {
        const event = createKeyboardEvent("A");
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should return false for event without key", () => {
        const event = new KeyboardEvent("keydown", { key: "" });
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(false);
    });

    it("should return false for null event", () => {
        const shortcut: NormalizedShortcut = {
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(null as any, shortcut)).toBe(false);
    });

    it("should handle special keys", () => {
        const event = createKeyboardEvent("Enter");
        const shortcut: NormalizedShortcut = {
            key: "enter",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });

    it("should handle Escape key", () => {
        const event = createKeyboardEvent("Escape");
        const shortcut: NormalizedShortcut = {
            key: "escape",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        };
        expect(matchesShortcut(event, shortcut)).toBe(true);
    });
});

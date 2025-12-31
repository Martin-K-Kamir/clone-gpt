import { describe, expect, it } from "vitest";

import { type NormalizedShortcut, parseShortcut } from "./parse-shortcut";

describe("parseShortcut", () => {
    it("should parse simple key", () => {
        const result = parseShortcut("a");
        expect(result).toEqual({
            key: "a",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should parse key with Cmd modifier", () => {
        const result = parseShortcut("Cmd+a");
        expect(result).toEqual({
            key: "a",
            metaKey: true,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should parse key with ⌘ modifier", () => {
        const result = parseShortcut("⌘+a");
        expect(result).toEqual({
            key: "a",
            metaKey: true,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should parse key with Ctrl modifier", () => {
        const result = parseShortcut("Ctrl+c");
        expect(result).toEqual({
            key: "c",
            metaKey: false,
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
        });
    });

    it("should parse key with Control modifier", () => {
        const result = parseShortcut("Control+v");
        expect(result).toEqual({
            key: "v",
            metaKey: false,
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
        });
    });

    it("should parse key with Shift modifier", () => {
        const result = parseShortcut("Shift+A");
        expect(result).toEqual({
            key: "a",
            metaKey: false,
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should parse key with ⇧ modifier", () => {
        const result = parseShortcut("⇧+a");
        expect(result).toEqual({
            key: "a",
            metaKey: false,
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should parse key with Alt modifier", () => {
        const result = parseShortcut("Alt+f");
        expect(result).toEqual({
            key: "f",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
        });
    });

    it("should parse key with Option modifier", () => {
        const result = parseShortcut("Option+n");
        expect(result).toEqual({
            key: "n",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: true,
        });
    });

    it("should parse key with multiple modifiers", () => {
        const result = parseShortcut("Cmd+Shift+k");
        expect(result).toEqual({
            key: "k",
            metaKey: true,
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should parse key with all modifiers", () => {
        const result = parseShortcut("Cmd+Ctrl+Shift+Alt+a");
        expect(result).toEqual({
            key: "a",
            metaKey: true,
            shiftKey: true,
            ctrlKey: true,
            altKey: true,
        });
    });

    it("should handle spaces in shortcut", () => {
        const result = parseShortcut("Cmd + a");
        expect(result).toEqual({
            key: "a",
            metaKey: true,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should convert key to lowercase", () => {
        const result = parseShortcut("A");
        expect(result.key).toBe("a");
    });

    it("should handle special keys", () => {
        const result = parseShortcut("Enter");
        expect(result).toEqual({
            key: "enter",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should handle empty string", () => {
        const result = parseShortcut("");
        expect(result).toEqual({
            key: "",
            metaKey: false,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
        });
    });

    it("should handle only modifiers without key", () => {
        const result = parseShortcut("Cmd+Ctrl");
        expect(result).toEqual({
            key: "",
            metaKey: true,
            shiftKey: false,
            ctrlKey: true,
            altKey: false,
        });
    });
});

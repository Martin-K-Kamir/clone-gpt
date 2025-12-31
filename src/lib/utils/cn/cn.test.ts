import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
    it("should merge class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
        expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
        expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
    });

    it("should handle arrays of classes", () => {
        expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
    });

    it("should handle objects with conditional classes", () => {
        expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
    });

    it("should merge Tailwind classes correctly", () => {
        expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("should handle empty inputs", () => {
        expect(cn()).toBe("");
        expect(cn("")).toBe("");
        expect(cn(null, undefined, false)).toBe("");
    });

    it("should handle mixed inputs", () => {
        expect(cn("foo", ["bar", "baz"], { qux: true })).toBe(
            "foo bar baz qux",
        );
    });

    it("should handle nested arrays", () => {
        expect(cn(["foo", ["bar", "baz"]], "qux")).toBe("foo bar baz qux");
    });

    it("should handle complex conditional logic", () => {
        const isActive = true;
        const isDisabled = false;
        expect(
            cn("base-class", isActive && "active", isDisabled && "disabled"),
        ).toBe("base-class active");
    });

    it("should merge conflicting Tailwind utilities", () => {
        expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
        expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });
});

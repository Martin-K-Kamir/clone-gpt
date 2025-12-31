import React from "react";
import { describe, expect, it } from "vitest";

import { extractTextFromReactNode } from "./extract-text-from-react-node";

describe("extractTextFromReactNode", () => {
    it("should return string as-is", () => {
        expect(extractTextFromReactNode("Hello")).toBe("Hello");
        expect(extractTextFromReactNode("World")).toBe("World");
    });

    it("should convert number to string", () => {
        expect(extractTextFromReactNode(42)).toBe("42");
        expect(extractTextFromReactNode(0)).toBe("0");
        expect(extractTextFromReactNode(-10)).toBe("-10");
        expect(extractTextFromReactNode(3.14)).toBe("3.14");
    });

    it("should handle arrays of strings", () => {
        expect(extractTextFromReactNode(["Hello", " ", "World"])).toBe(
            "Hello World",
        );
        expect(extractTextFromReactNode(["A", "B", "C"])).toBe("ABC");
    });

    it("should handle arrays of numbers", () => {
        expect(extractTextFromReactNode([1, 2, 3])).toBe("123");
        expect(extractTextFromReactNode([10, 20, 30])).toBe("102030");
    });

    it("should handle mixed arrays", () => {
        expect(extractTextFromReactNode(["Hello", 42, "World"])).toBe(
            "Hello42World",
        );
        expect(extractTextFromReactNode([1, " ", 2, " ", 3])).toBe("1 2 3");
    });

    it("should extract text from React element with string children", () => {
        const element = React.createElement("div", { children: "Hello" });
        expect(extractTextFromReactNode(element)).toBe("Hello");
    });

    it("should extract text from React element with number children", () => {
        const element = React.createElement("div", { children: 42 });
        expect(extractTextFromReactNode(element)).toBe("42");
    });

    it("should extract text from nested React elements", () => {
        const inner = React.createElement("span", { children: "World" });
        const outer = React.createElement("div", { children: inner });
        expect(extractTextFromReactNode(outer)).toBe("World");
    });

    it("should extract text from React element with array children", () => {
        const element = React.createElement("div", {
            children: ["Hello", " ", "World"],
        });
        expect(extractTextFromReactNode(element)).toBe("Hello World");
    });

    it("should extract text from deeply nested React elements", () => {
        const deep = React.createElement("span", { children: "Deep" });
        const middle = React.createElement("div", { children: deep });
        const outer = React.createElement("div", { children: middle });
        expect(extractTextFromReactNode(outer)).toBe("Deep");
    });

    it("should handle React element with multiple nested children", () => {
        const child1 = React.createElement("span", { children: "First" });
        const child2 = React.createElement("span", { children: "Second" });
        const parent = React.createElement("div", {
            children: [child1, " ", child2],
        });
        expect(extractTextFromReactNode(parent)).toBe("First Second");
    });

    it("should return empty string for null", () => {
        expect(extractTextFromReactNode(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
        expect(extractTextFromReactNode(undefined)).toBe("");
    });

    it("should return empty string for boolean", () => {
        expect(extractTextFromReactNode(true)).toBe("");
        expect(extractTextFromReactNode(false)).toBe("");
    });

    it("should handle empty array", () => {
        expect(extractTextFromReactNode([])).toBe("");
    });

    it("should handle array with null and undefined", () => {
        expect(extractTextFromReactNode([null, undefined, "text"])).toBe(
            "text",
        );
    });

    it("should handle React element with no children", () => {
        const element = React.createElement("div", {});
        expect(extractTextFromReactNode(element)).toBe("");
    });

    it("should handle React element with null children", () => {
        const element = React.createElement("div", { children: null });
        expect(extractTextFromReactNode(element)).toBe("");
    });

    it("should handle React element with undefined children", () => {
        const element = React.createElement("div", { children: undefined });
        expect(extractTextFromReactNode(element)).toBe("");
    });

    it("should handle React element with boolean children", () => {
        const element = React.createElement("div", { children: true });
        expect(extractTextFromReactNode(element)).toBe("");
    });

    it("should handle complex nested structure", () => {
        const inner1 = React.createElement("span", { children: "A" });
        const inner2 = React.createElement("span", { children: "B" });
        const middle = React.createElement("div", {
            children: [inner1, " ", inner2],
        });
        const outer = React.createElement("div", {
            children: ["Start ", middle, " End"],
        });
        expect(extractTextFromReactNode(outer)).toBe("Start A B End");
    });

    it("should handle React element with mixed children types", () => {
        const span = React.createElement("span", { children: "Span" });
        const element = React.createElement("div", {
            children: ["Text ", 42, " ", span, " More"],
        });
        expect(extractTextFromReactNode(element)).toBe("Text 42 Span More");
    });
});

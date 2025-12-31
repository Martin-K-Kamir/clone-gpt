import React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import { isReactElement } from "./is-react-element";

describe("isReactElement", () => {
    it("should return true for React element", () => {
        const element = React.createElement("div", null, "Test");
        expect(isReactElement(element)).toBe(true);
    });

    it("should return false for string", () => {
        expect(isReactElement("string")).toBe(false);
    });

    it("should return false for number", () => {
        expect(isReactElement(123)).toBe(false);
    });

    it("should return false for null", () => {
        expect(isReactElement(null)).toBe(false);
    });

    it("should return false for undefined", () => {
        expect(isReactElement(undefined)).toBe(false);
    });

    it("should return false for boolean", () => {
        expect(isReactElement(true)).toBe(false);
        expect(isReactElement(false)).toBe(false);
    });

    it("should return false for array", () => {
        expect(
            isReactElement([
                React.createElement("div", { key: "1" }, "1"),
                React.createElement("div", { key: "2" }, "2"),
            ]),
        ).toBe(false);
    });

    it("should return true for React.createElement result", () => {
        const element = React.createElement("div", null, "Test");
        expect(isReactElement(element)).toBe(true);
    });

    it("should return true for component element", () => {
        const Component = () => React.createElement("div", null, "Test");
        const element = React.createElement(Component);
        expect(isReactElement(element)).toBe(true);
    });

    it("should return true for fragment (fragments have type property)", () => {
        const fragment = React.createElement(React.Fragment);
        expect(isReactElement(fragment)).toBe(true);
    });

    it("should return false for plain object without type", () => {
        expect(isReactElement({ prop: "value" } as any)).toBe(false);
    });

    it("should return true for element with props", () => {
        const element = React.createElement(
            "div",
            { className: "test" },
            "Content",
        );
        expect(isReactElement(element)).toBe(true);
    });

    describe("type tests", () => {
        it("should narrow type to ReactElement", () => {
            const node: React.ReactNode = React.createElement(
                "div",
                null,
                "Test",
            );
            if (isReactElement(node)) {
                expectTypeOf(node).toMatchTypeOf<React.ReactElement>();
            }
        });

        it("should return boolean type", () => {
            const node: React.ReactNode = "string";
            expectTypeOf(isReactElement(node)).toEqualTypeOf<boolean>();
        });
    });
});

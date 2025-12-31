import React from "react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { mergeRefs } from "./merge-refs";

describe("mergeRefs", () => {
    it("should call function ref with value", () => {
        const callbackRef = vi.fn();
        const mergedRef = mergeRefs(callbackRef);

        mergedRef("test-value");

        expect(callbackRef).toHaveBeenCalledWith("test-value");
    });

    it("should set current on mutable ref object", () => {
        const refObject = React.createRef<string>();
        const mergedRef = mergeRefs(refObject);

        mergedRef("test-value");

        expect(refObject.current).toBe("test-value");
    });

    it("should handle multiple function refs", () => {
        const ref1 = vi.fn();
        const ref2 = vi.fn();
        const mergedRef = mergeRefs(ref1, ref2);

        mergedRef("test-value");

        expect(ref1).toHaveBeenCalledWith("test-value");
        expect(ref2).toHaveBeenCalledWith("test-value");
    });

    it("should handle multiple mutable ref objects", () => {
        const ref1 = React.createRef<string>();
        const ref2 = React.createRef<string>();
        const mergedRef = mergeRefs(ref1, ref2);

        mergedRef("test-value");

        expect(ref1.current).toBe("test-value");
        expect(ref2.current).toBe("test-value");
    });

    it("should handle mixed ref types", () => {
        const callbackRef = vi.fn();
        const refObject = React.createRef<string>();
        const mergedRef = mergeRefs(callbackRef, refObject);

        mergedRef("test-value");

        expect(callbackRef).toHaveBeenCalledWith("test-value");
        expect(refObject.current).toBe("test-value");
    });

    it("should ignore null refs", () => {
        const callbackRef = vi.fn();
        const mergedRef = mergeRefs(null, callbackRef, null);

        mergedRef("test-value");

        expect(callbackRef).toHaveBeenCalledWith("test-value");
    });

    it("should handle empty refs array", () => {
        const mergedRef = mergeRefs();

        expect(() => mergedRef("test-value")).not.toThrow();
    });

    it("should handle null value", () => {
        const callbackRef = vi.fn();
        const refObject = React.createRef<string>();
        const mergedRef = mergeRefs(callbackRef, refObject);

        mergedRef(null);

        expect(callbackRef).toHaveBeenCalledWith(null);
        expect(refObject.current).toBeNull();
    });

    it("should handle undefined refs", () => {
        const callbackRef = vi.fn();
        const mergedRef = mergeRefs(undefined as any, callbackRef);

        mergedRef("test-value");

        expect(callbackRef).toHaveBeenCalledWith("test-value");
    });

    it("should work with number type", () => {
        const ref1 = React.createRef<number>();
        const ref2 = vi.fn();
        const mergedRef = mergeRefs(ref1, ref2);

        mergedRef(42);

        expect(ref1.current).toBe(42);
        expect(ref2).toHaveBeenCalledWith(42);
    });

    it("should work with object type", () => {
        const ref1 = React.createRef<{ name: string }>();
        const ref2 = vi.fn();
        const mergedRef = mergeRefs(ref1, ref2);

        const obj = { name: "test" };
        mergedRef(obj);

        expect(ref1.current).toBe(obj);
        expect(ref2).toHaveBeenCalledWith(obj);
    });

    describe("type tests", () => {
        it("should return a ref callback function", () => {
            const ref = mergeRefs<HTMLDivElement>();
            expectTypeOf(ref).toBeFunction();
            expectTypeOf(ref)
                .parameter(0)
                .toEqualTypeOf<HTMLDivElement | null>();
        });

        it("should accept function refs", () => {
            const callbackRef = (value: HTMLDivElement | null) => {};
            const merged = mergeRefs<HTMLDivElement>(callbackRef);
            expectTypeOf(merged).toBeFunction();
        });

        it("should accept mutable ref objects", () => {
            const mutableRef = React.createRef<HTMLDivElement>();
            const merged = mergeRefs<HTMLDivElement>(
                mutableRef as React.MutableRefObject<HTMLDivElement>,
            );
            expectTypeOf(merged).toBeFunction();
        });

        it("should accept null refs", () => {
            const merged = mergeRefs<HTMLDivElement>(null);
            expectTypeOf(merged).toBeFunction();
        });
    });
});

import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useElementDimensions } from "./use-element-dimensions";

describe("useElementDimensions", () => {
    let element: HTMLDivElement;
    let ref: RefObject<HTMLDivElement>;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.appendChild(element);
        ref = { current: element };

        Object.defineProperty(element, "getBoundingClientRect", {
            value: () => ({
                width: 100,
                height: 50,
                top: 0,
                left: 0,
                right: 100,
                bottom: 50,
                x: 0,
                y: 0,
                toJSON: () => {},
            }),
            configurable: true,
        });
    });

    afterEach(() => {
        if (element.parentNode) {
            document.body.removeChild(element);
        }
        document.documentElement.style.removeProperty("--element-width");
        document.documentElement.style.removeProperty("--element-height");
    });

    it("returns width, height, updateDimensions, and removeDimensions", () => {
        const { result } = renderHook(() => useElementDimensions(ref));

        expect(result.current).toHaveProperty("width");
        expect(result.current).toHaveProperty("height");
        expect(result.current).toHaveProperty("updateDimensions");
        expect(result.current).toHaveProperty("removeDimensions");
    });

    it("initializes with zero dimensions when no ref is provided", () => {
        const { result } = renderHook(() => useElementDimensions());

        expect(result.current.width).toBe(0);
        expect(result.current.height).toBe(0);
    });

    it("updates dimensions when ref is provided", () => {
        const { result } = renderHook(() => useElementDimensions(ref));

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(result.current.width).toBe(100);
        expect(result.current.height).toBe(50);
    });

    it("creates CSS variables by default", () => {
        const { result } = renderHook(() => useElementDimensions(ref));

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");
        expect(
            document.documentElement.style.getPropertyValue("--element-height"),
        ).toBe("50px");
    });

    it("does not create CSS variables when createCssVariables is false", () => {
        const { result } = renderHook(() =>
            useElementDimensions(ref, { createCssVariables: false }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("");
        expect(
            document.documentElement.style.getPropertyValue("--element-height"),
        ).toBe("");
    });

    it("applies width and height corrections", () => {
        const { result } = renderHook(() =>
            useElementDimensions(ref, {
                widthCorrection: 10,
                heightCorrection: 5,
            }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(result.current.width).toBe(110);
        expect(result.current.height).toBe(55);
    });

    it("uses custom name for CSS variables", () => {
        const { result } = renderHook(() =>
            useElementDimensions(ref, { name: "custom" }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--custom-width"),
        ).toBe("100px");
        expect(
            document.documentElement.style.getPropertyValue("--custom-height"),
        ).toBe("50px");
    });

    it("removes CSS variables when element is null", () => {
        const { result } = renderHook(() => useElementDimensions(ref));

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");

        act(() => {
            result.current.updateDimensions(null);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("");
    });

    it("removeDimensions removes CSS variables", () => {
        const { result } = renderHook(() => useElementDimensions(ref));

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");

        act(() => {
            result.current.removeDimensions();
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("");
    });

    it("removeDimensions accepts custom name", () => {
        const { result } = renderHook(() =>
            useElementDimensions(ref, { name: "custom" }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--custom-width"),
        ).toBe("100px");

        act(() => {
            result.current.removeDimensions("custom");
        });

        expect(
            document.documentElement.style.getPropertyValue("--custom-width"),
        ).toBe("");
    });

    it("updateDimensions returns cleanup function that removes CSS variables", () => {
        const { result } = renderHook(() => useElementDimensions(ref));

        let cleanup: (() => void) | undefined;

        act(() => {
            cleanup = result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");

        act(() => {
            cleanup?.();
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("");
    });

    it("cleanup function does not remove CSS variables when removeCssVariables is false", () => {
        const { result } = renderHook(() =>
            useElementDimensions(ref, { removeCssVariables: false }),
        );

        let cleanup: (() => void) | undefined;

        act(() => {
            cleanup = result.current.updateDimensions(element, {
                removeCssVariables: false,
            });
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");

        act(() => {
            cleanup?.();
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");
    });

    it("works without ref when called with options only", () => {
        const { result } = renderHook(() =>
            useElementDimensions({ name: "test" }),
        );

        expect(result.current.width).toBe(0);
        expect(result.current.height).toBe(0);

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(result.current.width).toBe(100);
        expect(result.current.height).toBe(50);
        expect(
            document.documentElement.style.getPropertyValue("--test-width"),
        ).toBe("100px");
    });

    it("updates dimensions on resize when updateOnResize is true", () => {
        const { result } = renderHook(() =>
            useElementDimensions(ref, { updateOnResize: true }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(result.current.width).toBe(100);

        Object.defineProperty(element, "getBoundingClientRect", {
            value: () => ({
                width: 200,
                height: 100,
                top: 0,
                left: 0,
                right: 200,
                bottom: 100,
                x: 0,
                y: 0,
                toJSON: () => {},
            }),
            configurable: true,
        });

        act(() => {
            window.dispatchEvent(new Event("resize"));
        });

        expect(result.current.width).toBe(200);
        expect(result.current.height).toBe(100);
    });

    it("removes resize listener on unmount", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { unmount } = renderHook(() =>
            useElementDimensions(ref, { updateOnResize: true }),
        );

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "resize",
            expect.any(Function),
        );

        removeEventListenerSpy.mockRestore();
    });

    it("removes CSS variables on unmount when removeCssVariables is true", () => {
        const { result, unmount } = renderHook(() =>
            useElementDimensions(ref, { removeCssVariables: true }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");

        unmount();

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("");
    });

    it("does not remove CSS variables on unmount when removeCssVariables is false", () => {
        const { result, unmount } = renderHook(() =>
            useElementDimensions(ref, { removeCssVariables: false }),
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");

        unmount();

        expect(
            document.documentElement.style.getPropertyValue("--element-width"),
        ).toBe("100px");
    });

    it("updates dimensions when ref changes", () => {
        const { result, rerender } = renderHook(
            ({ ref }) => useElementDimensions(ref),
            {
                initialProps: { ref },
            },
        );

        act(() => {
            result.current.updateDimensions(element);
        });

        expect(result.current.width).toBe(100);

        const newElement = document.createElement("div");
        document.body.appendChild(newElement);
        Object.defineProperty(newElement, "getBoundingClientRect", {
            value: () => ({
                width: 300,
                height: 200,
                top: 0,
                left: 0,
                right: 300,
                bottom: 200,
                x: 0,
                y: 0,
                toJSON: () => {},
            }),
            configurable: true,
        });

        const newRef = { current: newElement };

        rerender({ ref: newRef });

        expect(result.current.width).toBe(300);
        expect(result.current.height).toBe(200);

        document.body.removeChild(newElement);
    });

    it("updateDimensions accepts custom options", () => {
        const nullRef = {
            current: null,
        } as unknown as RefObject<HTMLDivElement>;
        const { result } = renderHook(() =>
            useElementDimensions(nullRef, { name: "default" }),
        );

        act(() => {
            result.current.updateDimensions(element, {
                name: "custom",
                widthCorrection: 20,
                heightCorrection: 10,
            });
        });

        expect(result.current.width).toBe(120);
        expect(result.current.height).toBe(60);
        expect(
            document.documentElement.style.getPropertyValue("--custom-width"),
        ).toBe("120px");
        expect(
            document.documentElement.style.getPropertyValue("--custom-height"),
        ).toBe("60px");
    });
});

import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHorizontalScroll } from "./use-horizontal-scroll";

global.ResizeObserver = class ResizeObserver {
    constructor(public callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
};

global.MutationObserver = class MutationObserver {
    constructor(public callback: MutationCallback) {}
    observe() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
};

describe("useHorizontalScroll", () => {
    let element: HTMLDivElement;
    let ref: RefObject<HTMLDivElement>;

    beforeEach(() => {
        element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "50px";
        element.style.overflow = "hidden";
        document.body.appendChild(element);

        ref = { current: element };
    });

    afterEach(() => {
        if (element.parentNode) {
            document.body.removeChild(element);
        }
    });

    it("should return event handlers and canScroll state", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        expect(result.current).toHaveProperty("onWheel");
        expect(result.current).toHaveProperty("onMouseDown");
        expect(result.current).toHaveProperty("onMouseLeave");
        expect(result.current).toHaveProperty("onMouseUp");
        expect(result.current).toHaveProperty("onMouseMove");
        expect(result.current).toHaveProperty("canScroll");
    });

    it("should set canScroll to false when element has no overflow", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        expect(result.current.canScroll).toBe(false);
    });

    it("should set canScroll to true when element has overflow", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        expect(result.current.canScroll).toBe(true);
    });

    it("should set canScroll to false when ref.current is null", () => {
        const nullRef = {
            current: null,
        } as unknown as RefObject<HTMLDivElement>;

        const { result } = renderHook(() => useHorizontalScroll(nullRef));

        expect(result.current.canScroll).toBe(false);
    });

    it("should prevent default and scroll horizontally on wheel when canScroll is true", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });
        element.scrollLeft = 0;

        const { result } = renderHook(() => useHorizontalScroll(ref));

        const wheelEvent = new WheelEvent("wheel", {
            deltaY: 50,
            bubbles: true,
            cancelable: true,
        });

        Object.defineProperty(wheelEvent, "currentTarget", {
            value: element,
            configurable: true,
        });

        const preventDefaultSpy = vi.spyOn(wheelEvent, "preventDefault");

        act(() => {
            result.current.onWheel(
                wheelEvent as unknown as React.WheelEvent<HTMLElement>,
            );
        });

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(element.scrollLeft).toBe(50);
    });

    it("should not prevent default or scroll when canScroll is false", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });
        element.scrollLeft = 0;

        const { result } = renderHook(() => useHorizontalScroll(ref));

        const wheelEvent = new WheelEvent("wheel", {
            deltaY: 50,
            bubbles: true,
            cancelable: true,
        });

        Object.defineProperty(wheelEvent, "currentTarget", {
            value: element,
            configurable: true,
        });

        const preventDefaultSpy = vi.spyOn(wheelEvent, "preventDefault");

        act(() => {
            result.current.onWheel(
                wheelEvent as unknown as React.WheelEvent<HTMLElement>,
            );
        });

        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(element.scrollLeft).toBe(0);
    });

    it("should handle mouse down and set cursor to grabbing", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "offsetLeft", {
            value: 10,
            configurable: true,
        });
        element.scrollLeft = 20;

        const { result } = renderHook(() => useHorizontalScroll(ref));

        const mouseDownEvent = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(mouseDownEvent, "pageX", {
            value: 60,
            configurable: true,
        });

        const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");

        act(() => {
            result.current.onMouseDown(
                mouseDownEvent as unknown as React.MouseEvent<HTMLElement>,
            );
        });

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(element.style.cursor).toBe("grabbing");
    });

    it("should not handle mouse down when canScroll is false", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        const mouseDownEvent = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(mouseDownEvent, "pageX", {
            value: 60,
            configurable: true,
        });

        const preventDefaultSpy = vi.spyOn(mouseDownEvent, "preventDefault");

        act(() => {
            result.current.onMouseDown(
                mouseDownEvent as unknown as React.MouseEvent<HTMLElement>,
            );
        });

        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(element.style.cursor).not.toBe("grabbing");
    });

    it("should handle mouse leave and reset cursor", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        act(() => {
            result.current.onMouseLeave();
        });

        expect(element.style.cursor).toBe("grab");
    });

    it("should set cursor to default when canScroll is false on mouse leave", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        act(() => {
            result.current.onMouseLeave();
        });

        expect(element.style.cursor).toBe("default");
    });

    it("should handle mouse up and reset cursor", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const { result } = renderHook(() => useHorizontalScroll(ref));

        act(() => {
            result.current.onMouseUp();
        });

        expect(element.style.cursor).toBe("grab");
    });

    it("should handle mouse move and scroll when dragging", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(element, "offsetLeft", {
            value: 10,
            configurable: true,
        });
        element.scrollLeft = 20;

        const { result } = renderHook(() => useHorizontalScroll(ref));

        const mouseDownEvent = new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(mouseDownEvent, "pageX", {
            value: 60,
            configurable: true,
        });

        act(() => {
            result.current.onMouseDown(
                mouseDownEvent as unknown as React.MouseEvent<HTMLElement>,
            );
        });

        const mouseMoveEvent = new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(mouseMoveEvent, "pageX", {
            value: 80,
            configurable: true,
        });

        const preventDefaultSpy = vi.spyOn(mouseMoveEvent, "preventDefault");

        act(() => {
            result.current.onMouseMove(
                mouseMoveEvent as unknown as React.MouseEvent<HTMLElement>,
            );
        });

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(element.scrollLeft).toBe(-20);
    });

    it("should not scroll when mouse move is called without dragging", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });
        element.scrollLeft = 20;

        const { result } = renderHook(() => useHorizontalScroll(ref));

        const mouseMoveEvent = new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(mouseMoveEvent, "pageX", {
            value: 80,
            configurable: true,
        });

        const preventDefaultSpy = vi.spyOn(mouseMoveEvent, "preventDefault");

        act(() => {
            result.current.onMouseMove(
                mouseMoveEvent as unknown as React.MouseEvent<HTMLElement>,
            );
        });

        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(element.scrollLeft).toBe(20);
    });

    it("should clean up observers on unmount", () => {
        Object.defineProperty(element, "scrollWidth", {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(element, "clientWidth", {
            value: 100,
            configurable: true,
        });

        const disconnectSpy = vi.fn();
        const ResizeObserverOriginal = global.ResizeObserver;
        const MutationObserverOriginal = global.MutationObserver;

        global.ResizeObserver = class MockResizeObserver {
            disconnect = disconnectSpy;
            constructor(public callback: ResizeObserverCallback) {}
            observe() {}
            unobserve() {}
        } as unknown as typeof ResizeObserver;

        global.MutationObserver = class MockMutationObserver {
            disconnect = disconnectSpy;
            constructor(public callback: MutationCallback) {}
            observe() {}
            takeRecords() {
                return [];
            }
        } as unknown as typeof MutationObserver;

        const { unmount } = renderHook(() => useHorizontalScroll(ref));

        unmount();

        expect(disconnectSpy).toHaveBeenCalledTimes(2);

        global.ResizeObserver = ResizeObserverOriginal;
        global.MutationObserver = MutationObserverOriginal;
    });
});

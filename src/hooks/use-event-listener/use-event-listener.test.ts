import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEventListener } from "./use-event-listener";

describe("useEventListener", () => {
    let addEventListenerSpy: ReturnType<typeof vi.fn>;
    let removeEventListenerSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        addEventListenerSpy = vi.fn();
        removeEventListenerSpy = vi.fn();
        window.addEventListener =
            addEventListenerSpy as typeof window.addEventListener;
        window.removeEventListener =
            removeEventListenerSpy as typeof window.removeEventListener;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("adds event listener to window when no element is provided", () => {
        const handler = vi.fn();

        renderHook(() => useEventListener("click", handler));

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "click",
            expect.any(Function),
            undefined,
        );
    });

    it("removes event listener on unmount", () => {
        const handler = vi.fn();
        const { unmount } = renderHook(() =>
            useEventListener("click", handler),
        );

        const eventListener = addEventListenerSpy.mock.calls[0][1];

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            "click",
            eventListener,
            undefined,
        );
    });

    it("calls handler when event is dispatched", () => {
        const handler = vi.fn();
        renderHook(() => useEventListener("click", handler));

        const eventListener = addEventListenerSpy.mock.calls[0][1];
        const event = new Event("click");

        eventListener(event);

        expect(handler).toHaveBeenCalledWith(event);
    });

    it("uses updated handler when handler changes", () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        const { rerender } = renderHook(
            ({ handler }) => useEventListener("click", handler),
            {
                initialProps: { handler: handler1 },
            },
        );

        const eventListener1 = addEventListenerSpy.mock.calls[0][1];
        const event = new Event("click");

        eventListener1(event);
        expect(handler1).toHaveBeenCalled();

        rerender({ handler: handler2 });

        const eventListener2 =
            addEventListenerSpy.mock.calls[
                addEventListenerSpy.mock.calls.length - 1
            ][1];

        eventListener2(event);
        expect(handler2).toHaveBeenCalled();
    });

    it("passes options to addEventListener", () => {
        const handler = vi.fn();
        const options = { passive: true };

        renderHook(() => useEventListener("scroll", handler, options));

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "scroll",
            expect.any(Function),
            options,
        );
    });

    it("adds event listener to provided element", () => {
        const handler = vi.fn();
        const element = document.createElement("div");
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        element.addEventListener = addEventListener;
        element.removeEventListener = removeEventListener;

        renderHook(() => useEventListener("click", handler, element));

        expect(addEventListener).toHaveBeenCalledWith(
            "click",
            expect.any(Function),
            undefined,
        );
    });

    it("removes event listener from element on unmount", () => {
        const handler = vi.fn();
        const element = document.createElement("div");
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        element.addEventListener = addEventListener;
        element.removeEventListener = removeEventListener;

        const { unmount } = renderHook(() =>
            useEventListener("click", handler, element),
        );

        const eventListener = addEventListener.mock.calls[0][1];

        unmount();

        expect(removeEventListener).toHaveBeenCalledWith(
            "click",
            eventListener,
            undefined,
        );
    });

    it("handles null element by using window", () => {
        const handler = vi.fn();

        renderHook(() => useEventListener("click", handler, null));

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "click",
            expect.any(Function),
            undefined,
        );
    });

    it("handles null element with options", () => {
        const handler = vi.fn();
        const options = { passive: true };

        renderHook(() => useEventListener("scroll", handler, null, options));

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "scroll",
            expect.any(Function),
            options,
        );
    });

    it("updates event listener when element changes", () => {
        const handler = vi.fn();
        const element1 = document.createElement("div");
        const addEventListener1 = vi.fn();
        const removeEventListener1 = vi.fn();
        element1.addEventListener = addEventListener1;
        element1.removeEventListener = removeEventListener1;

        const element2 = document.createElement("div");
        const addEventListener2 = vi.fn();
        const removeEventListener2 = vi.fn();
        element2.addEventListener = addEventListener2;
        element2.removeEventListener = removeEventListener2;

        const { rerender } = renderHook(
            ({ element }) => useEventListener("click", handler, element),
            {
                initialProps: { element: element1 },
            },
        );

        expect(addEventListener1).toHaveBeenCalled();

        rerender({ element: element2 });

        expect(removeEventListener1).toHaveBeenCalled();
        expect(addEventListener2).toHaveBeenCalled();
    });
});

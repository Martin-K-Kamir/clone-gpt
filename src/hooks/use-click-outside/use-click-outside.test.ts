import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useClickOutside } from "./use-click-outside";

describe("useClickOutside", () => {
    let container: HTMLDivElement;
    let element: HTMLDivElement;
    let ref: React.RefObject<HTMLDivElement | null>;

    beforeEach(() => {
        container = document.createElement("div");
        element = document.createElement("div");
        container.appendChild(element);
        document.body.appendChild(container);
        ref = createRef<HTMLDivElement | null>();
        ref.current = element;
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    const createPointerEvent = () =>
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true });

    it("should call callback when clicking outside element", () => {
        const callback = vi.fn();
        const outsideElement = document.createElement("div");
        document.body.appendChild(outsideElement);

        renderHook(() => useClickOutside(ref, callback));

        outsideElement.dispatchEvent(createPointerEvent());

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0][0].isClickOutside).toBe(true);

        document.body.removeChild(outsideElement);
    });

    it("should not call callback when clicking inside element or children", () => {
        const callback = vi.fn();
        const childElement = document.createElement("div");
        element.appendChild(childElement);

        renderHook(() => useClickOutside(ref, callback));

        element.dispatchEvent(createPointerEvent());
        childElement.dispatchEvent(createPointerEvent());

        expect(callback).not.toHaveBeenCalled();
    });

    it("should not call callback when ref is null", () => {
        const callback = vi.fn();
        const nullRef = createRef<HTMLDivElement>();
        const outsideElement = document.createElement("div");
        document.body.appendChild(outsideElement);

        renderHook(() => useClickOutside(nullRef, callback));

        outsideElement.dispatchEvent(createPointerEvent());

        expect(callback).not.toHaveBeenCalled();
        document.body.removeChild(outsideElement);
    });

    it("should stop responding to clicks after unmount", () => {
        const callback = vi.fn();
        const outsideElement = document.createElement("div");
        document.body.appendChild(outsideElement);

        const { unmount } = renderHook(() => useClickOutside(ref, callback));

        outsideElement.dispatchEvent(createPointerEvent());
        expect(callback).toHaveBeenCalledTimes(1);

        vi.clearAllMocks();
        unmount();
        outsideElement.dispatchEvent(createPointerEvent());

        expect(callback).not.toHaveBeenCalled();
        document.body.removeChild(outsideElement);
    });

    it("should update callback when it changes", () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        const outsideElement = document.createElement("div");
        document.body.appendChild(outsideElement);

        const { rerender } = renderHook(
            ({ callback }) => useClickOutside(ref, callback),
            {
                initialProps: { callback: callback1 },
            },
        );

        outsideElement.dispatchEvent(createPointerEvent());
        expect(callback1).toHaveBeenCalledTimes(1);

        rerender({ callback: callback2 });
        outsideElement.dispatchEvent(createPointerEvent());

        expect(callback2).toHaveBeenCalledTimes(1);
        document.body.removeChild(outsideElement);
    });
});

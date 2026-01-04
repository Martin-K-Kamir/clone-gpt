import { renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHover } from "./use-hover";

describe("useHover", () => {
    let element: HTMLDivElement;
    let ref: React.RefObject<HTMLDivElement | null>;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.appendChild(element);
        ref = createRef<HTMLDivElement | null>();
        ref.current = element;
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    it("returns false initially", () => {
        const { result } = renderHook(() => useHover(ref));

        expect(result.current).toBe(false);
    });

    it("returns true when hovered and false when not hovered", async () => {
        const { result } = renderHook(() => useHover(ref));

        element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        element.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it("calls callbacks on hover state changes", async () => {
        const onEnter = vi.fn();
        const onLeave = vi.fn();

        renderHook(() => useHover(ref, { onEnter, onLeave }));

        element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        await waitFor(() => {
            expect(onEnter).toHaveBeenCalledTimes(1);
        });

        element.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
        await waitFor(() => {
            expect(onLeave).toHaveBeenCalledTimes(1);
        });
    });

    it("handles null ref", () => {
        const nullRef = createRef<HTMLDivElement | null>();
        const { result } = renderHook(() => useHover(nullRef));

        expect(result.current).toBe(false);
    });

    it("stops responding to events after unmount", () => {
        const onEnter = vi.fn();
        const { unmount } = renderHook(() => useHover(ref, { onEnter }));

        element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        expect(onEnter).toHaveBeenCalled();

        vi.clearAllMocks();
        unmount();

        element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        expect(onEnter).not.toHaveBeenCalled();
    });

    it("updates callbacks when they change", async () => {
        const onEnter1 = vi.fn();
        const onEnter2 = vi.fn();

        const { rerender } = renderHook(
            ({ onEnter }) => useHover(ref, { onEnter }),
            {
                initialProps: { onEnter: onEnter1 },
            },
        );

        element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        await waitFor(() => {
            expect(onEnter1).toHaveBeenCalledTimes(1);
        });

        rerender({ onEnter: onEnter2 });
        element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        await waitFor(() => {
            expect(onEnter2).toHaveBeenCalledTimes(1);
        });
    });
});

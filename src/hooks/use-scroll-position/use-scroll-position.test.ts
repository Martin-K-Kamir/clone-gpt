import { act, renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollPosition } from "./use-scroll-position";

describe("useScrollPosition", () => {
    it("returns undefined for isAtBottom and isAtTop initially when no initial value", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        element.style.height = "100px";
        element.style.overflow = "auto";
        document.body.appendChild(element);
        ref.current = element;

        const { result } = renderHook(() => useScrollPosition(ref));

        expect(result.current.isAtBottom).toBeUndefined();
        expect(result.current.isAtTop).toBeUndefined();

        document.body.removeChild(element);
    });

    it("returns initial value for isAtBottom and isAtTop when provided", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        element.style.height = "100px";
        element.style.overflow = "auto";
        document.body.appendChild(element);
        ref.current = element;

        const { result } = renderHook(() => useScrollPosition(ref, true));

        expect(result.current.isAtBottom).toBe(true);
        expect(result.current.isAtTop).toBe(true);
        document.body.removeChild(element);
    });

    it("detects when scrolled to bottom", async () => {
        vi.useRealTimers();

        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        element.style.height = "100px";
        element.style.overflow = "auto";
        const content = document.createElement("div");
        content.style.height = "300px";
        element.appendChild(content);
        document.body.appendChild(element);
        ref.current = element;

        const { result } = renderHook(() => useScrollPosition(ref));

        await waitFor(() => {
            expect(result.current.isAtTop).not.toBeUndefined();
        });

        await act(async () => {
            element.scrollTop = element.scrollHeight - element.clientHeight;
            const scrollEvent = new Event("scroll", { bubbles: true });
            element.dispatchEvent(scrollEvent);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        await waitFor(() => {
            expect(result.current.isAtBottom).toBe(true);
        });

        document.body.removeChild(element);
        vi.useFakeTimers();
    });

    it("detects when scrolled to top", async () => {
        vi.useRealTimers();

        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        element.style.height = "100px";
        element.style.overflow = "auto";
        const content = document.createElement("div");
        content.style.height = "300px";
        element.appendChild(content);
        document.body.appendChild(element);
        ref.current = element;

        const { result } = renderHook(() => useScrollPosition(ref));

        await waitFor(() => {
            expect(result.current.isAtTop).not.toBeUndefined();
        });

        await act(async () => {
            element.scrollTop = 100;
            const scrollEvent = new Event("scroll", { bubbles: true });
            element.dispatchEvent(scrollEvent);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        await waitFor(() => {
            expect(result.current.isAtTop).toBe(false);
        });

        await act(async () => {
            element.scrollTop = 0;
            const scrollEvent = new Event("scroll", { bubbles: true });
            element.dispatchEvent(scrollEvent);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        await waitFor(() => {
            expect(result.current.isAtTop).toBe(true);
        });

        document.body.removeChild(element);
        vi.useFakeTimers();
    });

    it("uses threshold when checking bottom position", async () => {
        vi.useRealTimers();

        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        element.style.height = "100px";
        element.style.overflow = "auto";
        const content = document.createElement("div");
        content.style.height = "300px";
        element.appendChild(content);
        document.body.appendChild(element);
        ref.current = element;

        const { result } = renderHook(() =>
            useScrollPosition(ref, undefined, { threshold: 20 }),
        );

        await waitFor(() => {
            expect(result.current.isAtTop).not.toBeUndefined();
        });

        await act(async () => {
            const threshold = 20;
            element.scrollTop =
                element.scrollHeight - element.clientHeight - threshold + 1;
            const scrollEvent = new Event("scroll", { bubbles: true });
            element.dispatchEvent(scrollEvent);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        await waitFor(() => {
            expect(result.current.isAtBottom).toBe(true);
        });

        document.body.removeChild(element);
        vi.useFakeTimers();
    });

    it("handles null ref gracefully", () => {
        const ref = createRef<HTMLDivElement>();

        const { result } = renderHook(() => useScrollPosition(ref));

        expect(result.current.isAtBottom).toBeUndefined();
        expect(result.current.isAtTop).toBeUndefined();
    });

    it("updates when threshold changes", async () => {
        vi.useRealTimers();

        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        element.style.height = "100px";
        element.style.overflow = "auto";
        const content = document.createElement("div");
        content.style.height = "300px";
        element.appendChild(content);
        document.body.appendChild(element);
        ref.current = element;

        const { result, rerender } = renderHook(
            ({ threshold }) => useScrollPosition(ref, undefined, { threshold }),
            {
                initialProps: { threshold: 10 },
            },
        );

        await waitFor(() => {
            expect(result.current.isAtTop).not.toBeUndefined();
        });

        await act(async () => {
            element.scrollTop =
                element.scrollHeight - element.clientHeight - 15;
            const scrollEvent = new Event("scroll", { bubbles: true });
            element.dispatchEvent(scrollEvent);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        await waitFor(() => {
            expect(result.current.isAtBottom).toBe(false);
        });

        rerender({ threshold: 20 });

        await waitFor(() => {
            expect(result.current.isAtBottom).toBe(true);
        });

        document.body.removeChild(element);
        vi.useFakeTimers();
    });
});

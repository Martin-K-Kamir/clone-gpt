import { renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollbarSize } from "./use-scrollbar-size";

describe("useScrollbarSize", () => {
    const originalStyle = document.documentElement.style.cssText;

    beforeEach(() => {
        document.documentElement.style.cssText = "";
        vi.clearAllMocks();
    });

    afterEach(() => {
        document.documentElement.style.cssText = originalStyle;
    });

    it("should return 0 initially when ref is null", () => {
        const ref = createRef<HTMLDivElement>();
        const { result } = renderHook(() => useScrollbarSize(ref));

        expect(result.current).toBe(0);
    });

    it("should return 0 when element has no scrollbar", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflow = "hidden";
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        const { result } = renderHook(() => useScrollbarSize(ref));

        expect(result.current).toBe(0);
        document.body.removeChild(element);
    });

    it("should return scrollbar size when element has scrollbar", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflowY = "scroll";
        element.style.paddingRight = "0";
        const innerContent = document.createElement("div");
        innerContent.style.height = "200px";
        element.appendChild(innerContent);
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        const { result } = renderHook(() => useScrollbarSize(ref));

        const scrollbarWidth = element.offsetWidth - element.clientWidth;
        expect(result.current).toBe(scrollbarWidth);
        document.body.removeChild(element);
    });

    it("should set CSS variable when scrollbar exists", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflowY = "scroll";
        const innerContent = document.createElement("div");
        innerContent.style.height = "200px";
        element.appendChild(innerContent);
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        renderHook(() => useScrollbarSize(ref));

        const scrollbarWidth = element.offsetWidth - element.clientWidth;
        if (scrollbarWidth > 0) {
            expect(
                document.documentElement.style.getPropertyValue(
                    "--scrollbar-size",
                ),
            ).toBe(`${scrollbarWidth}px`);
        }

        document.body.removeChild(element);
    });

    it("should remove CSS variable when no scrollbar", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflow = "hidden";
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        renderHook(() => useScrollbarSize(ref));

        expect(
            document.documentElement.style.getPropertyValue("--scrollbar-size"),
        ).toBe("");

        document.body.removeChild(element);
    });

    it("should use custom CSS variable name", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflowY = "scroll";
        const innerContent = document.createElement("div");
        innerContent.style.height = "200px";
        element.appendChild(innerContent);
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        renderHook(() =>
            useScrollbarSize(ref, { cssVariableName: "--custom-scrollbar" }),
        );

        const scrollbarWidth = element.offsetWidth - element.clientWidth;
        if (scrollbarWidth > 0) {
            expect(
                document.documentElement.style.getPropertyValue(
                    "--custom-scrollbar",
                ),
            ).toBe(`${scrollbarWidth}px`);
        }

        document.body.removeChild(element);
    });

    it("should return undefined when skipState is true", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflowY = "scroll";
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        const { result } = renderHook(() =>
            useScrollbarSize(ref, { skipState: true }),
        );

        expect(result.current).toBeUndefined();
        document.body.removeChild(element);
    });

    it("should update on window resize", async () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflowY = "scroll";
        const innerContent = document.createElement("div");
        innerContent.style.height = "200px";
        element.appendChild(innerContent);
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        const { result } = renderHook(() => useScrollbarSize(ref));

        const initialSize = result.current;

        window.dispatchEvent(new Event("resize"));

        await waitFor(() => {
            const newSize = element.offsetWidth - element.clientWidth;
            expect(result.current).toBe(newSize);
        });

        document.body.removeChild(element);
    });

    it("should update when ref changes", async () => {
        const element1 = document.createElement("div");
        element1.style.width = "100px";
        element1.style.height = "100px";
        element1.style.overflowY = "scroll";
        const content1 = document.createElement("div");
        content1.style.height = "200px";
        element1.appendChild(content1);
        document.body.appendChild(element1);

        const element2 = document.createElement("div");
        element2.style.width = "200px";
        element2.style.height = "200px";
        element2.style.overflowY = "scroll";
        const content2 = document.createElement("div");
        content2.style.height = "200px";
        element2.appendChild(content2);
        document.body.appendChild(element2);

        const ref = createRef<HTMLDivElement>();
        ref.current = element1;

        const { result, rerender } = renderHook(() => useScrollbarSize(ref));

        const size1 = result.current;

        ref.current = element2;
        rerender();

        await waitFor(() => {
            const size2 = element2.offsetWidth - element2.clientWidth;
            expect(result.current).toBe(size2);
        });

        document.body.removeChild(element1);
        document.body.removeChild(element2);
    });

    it("should remove CSS variable when ref becomes null", () => {
        const element = document.createElement("div");
        element.style.width = "100px";
        element.style.height = "100px";
        element.style.overflowY = "scroll";
        const innerContent = document.createElement("div");
        innerContent.style.height = "200px";
        element.appendChild(innerContent);
        document.body.appendChild(element);

        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        const { rerender } = renderHook(() => useScrollbarSize(ref));

        const scrollbarWidth = element.offsetWidth - element.clientWidth;
        if (scrollbarWidth > 0) {
            expect(
                document.documentElement.style.getPropertyValue(
                    "--scrollbar-size",
                ),
            ).toBe(`${scrollbarWidth}px`);
        }

        ref.current = null;
        rerender();

        expect(
            document.documentElement.style.getPropertyValue("--scrollbar-size"),
        ).toBe("");

        document.body.removeChild(element);
    });
});

import { act, renderHook } from "@testing-library/react";
import { ChatStatus } from "ai";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEventListener, useThrottledEffect } from "@/hooks";

import { useAutoMessageScroll } from "./use-auto-message-scroll";

vi.mock("@/hooks", () => ({
    useEventListener: vi.fn(),
    useThrottledEffect: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
    throttle: vi.fn(fn => fn),
}));

const mockUseEventListener = vi.mocked(useEventListener);
const mockUseThrottledEffect = vi.mocked(useThrottledEffect);

describe("useAutoMessageScroll", () => {
    let containerRef: React.RefObject<HTMLDivElement | null>;
    let lastMessageRef: React.RefObject<HTMLDivElement | null>;
    let containerElement: HTMLDivElement;
    let lastMessageElement: HTMLDivElement;
    let throttledEffectCallback: (() => void) | undefined;

    beforeEach(() => {
        vi.clearAllMocks();

        containerElement = document.createElement("div");
        Object.defineProperty(containerElement, "scrollHeight", {
            value: 1000,
            writable: true,
            configurable: true,
        });
        Object.defineProperty(containerElement, "scrollTo", {
            value: vi.fn(),
            writable: true,
            configurable: true,
        });
        containerRef = createRef<HTMLDivElement | null>();
        containerRef.current = containerElement;

        lastMessageElement = document.createElement("div");
        Object.defineProperty(lastMessageElement, "scrollIntoView", {
            value: vi.fn(),
            writable: true,
            configurable: true,
        });
        lastMessageRef = createRef<HTMLDivElement | null>();
        lastMessageRef.current = lastMessageElement;

        mockUseEventListener.mockReturnValue(undefined);
        mockUseThrottledEffect.mockImplementation(callback => {
            throttledEffectCallback = callback;
            return undefined;
        });
    });

    it("should return ref for auto scroll state", () => {
        const { result } = renderHook(() =>
            useAutoMessageScroll({
                containerRef,
                lastMessageRef,
                messages: [],
                status: "ready",
            }),
        );

        expect(result.current).toBeDefined();
        expect(result.current.current).toBe(true);
    });

    it("should scroll last message into view when status is streaming", () => {
        renderHook(() =>
            useAutoMessageScroll({
                containerRef,
                lastMessageRef,
                messages: ["message1"],
                status: "streaming",
            }),
        );

        act(() => {
            throttledEffectCallback?.();
        });

        expect(lastMessageElement.scrollIntoView).toHaveBeenCalledWith({
            block: "end",
            behavior: "smooth",
        });
    });

    it("should scroll last message into view when status is submitted", () => {
        renderHook(() =>
            useAutoMessageScroll({
                containerRef,
                lastMessageRef,
                messages: ["message1"],
                status: "submitted",
            }),
        );

        act(() => {
            throttledEffectCallback?.();
        });

        expect(lastMessageElement.scrollIntoView).toHaveBeenCalledWith({
            block: "end",
            behavior: "smooth",
        });
    });

    it("should enable auto scroll when status changes to submitted", () => {
        const { result, rerender } = renderHook(
            ({ status }) =>
                useAutoMessageScroll({
                    containerRef,
                    lastMessageRef,
                    messages: [],
                    status: status as ChatStatus,
                }),
            {
                initialProps: { status: "ready" },
            },
        );

        expect(result.current.current).toBe(true);

        rerender({ status: "submitted" });

        act(() => {
            throttledEffectCallback?.();
        });

        expect(result.current.current).toBe(true);
    });

    it("should not scroll when auto scroll is disabled", () => {
        const { result } = renderHook(() =>
            useAutoMessageScroll({
                containerRef,
                lastMessageRef,
                messages: ["message1"],
                status: "streaming",
            }),
        );

        result.current.current = false;

        act(() => {
            throttledEffectCallback?.();
        });

        expect(lastMessageElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should not scroll when status is ready", () => {
        renderHook(() =>
            useAutoMessageScroll({
                containerRef,
                lastMessageRef,
                messages: ["message1"],
                status: "ready",
            }),
        );

        act(() => {
            throttledEffectCallback?.();
        });

        expect(lastMessageElement.scrollIntoView).not.toHaveBeenCalled();
    });

    it("should not scroll when last message ref is null", () => {
        const nullRef = createRef<HTMLDivElement | null>();
        nullRef.current = null;

        renderHook(() =>
            useAutoMessageScroll({
                containerRef,
                lastMessageRef: nullRef,
                messages: ["message1"],
                status: "streaming",
            }),
        );

        act(() => {
            throttledEffectCallback?.();
        });

        expect(lastMessageElement.scrollIntoView).not.toHaveBeenCalled();
    });
});
